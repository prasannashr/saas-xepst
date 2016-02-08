/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/controllers/projects.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

var Project = require('mongoose').model('Project'),
    Role = require('mongoose').model('Role'),
    mongoose = require('mongoose'),
    srStatus = require('./sr.js'),
    _ = require('underscore'),
    async = require("async"),
    User = require('mongoose').model('User'),
    trycatch = require('trycatch');

/*----------------------------------------------------------------------------------------------------
 Name: createProject
 Description: controller to create new project
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.createProject = function(req, res) {
    trycatch(function() {
        req.body.customerId = req.params.customerId;
        req.body.project_createdDate = new Date();
        
        // creates new project in the project collection with form data         
        Project.create(req.body, function(err, project) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(project);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: getProjectList
 Description: controller to get project Lists of customer by customer ID
 Author: SubinJoshi
 Date : 12 Aug 2015

 Date   Author Version Description
    ------------------------------------------------------------------------
    10/09/2015 subin v1 Controller to get project's Titles of customer/ domain  
    18/09/2015 rikesh  v1.1 conditions added to return only those projects to non-admin users in which they are involved

------------------------------------------------------------------------------------------------------*/
exports.getProjectList = function(req, res) {
    trycatch(function() {     
        //find all projects by customer ID     
        Project.find({
            'customerId': req.params.customerId
        }).exec(function(err, projects) {
            res.send(projects);
        })
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteProject
 Description: controller to delete project by project ID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.deleteProject = function(req, res) {
    trycatch(function() {
        // find project by project ID    
        Project.findById(req.params.projectId, function(err, project) {
            if (err) {
                return handleError(res, err);
            }
            if (!project) {
                return res.send(404);
            }
            // remove project matched by project ID from the project collection        
            project.remove(function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(project);
            });
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getProjectDetail
 Description: Controller to get project Detail by its projectID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.getProjectDetail = function(req, res) {
    ProjectId = req.params.projectId;
    trycatch(function() {
  
        //find one project detail by project ID      
        Project.findById(ProjectId, function(err, project) {
            if (err) {
                return handleError(res, err);
            }
            if (!project) {
                return res.send(404);
            }
            var projectJSON;
            var projectMembers =project.members;
            async.series([
                //Load members fullName from member's(user's) id and update the project.members object with fullName
                function(callback) {
                    async.forEach(project.members, function(member, memberCallback) { //The second argument (callback) is the "task callback" for a specific member
                        User.aggregate([
                            { "$match": { customerId: req.user.customerId } },
                            { "$unwind": "$app_users" },
                            { "$match": { "app_users._id": mongoose.Types.ObjectId(member.user_id) } },
                            { "$project": {'app_users.firstName': 1, 'app_users.lastName': 1, 'app_users.proPic':1, '_id': 0}}
                        ],
                        function(err,result) {
                            
                            project.members[project.members.indexOf(member)].fullname =  result[0].app_users.firstName + " " + result[0].app_users.lastName;
                        });
                        memberCallback();
                    }, function(err) {
                        if (err) return next(err);                    
                        callback();
                    });
                    
                    //callback();
                },
                //Load total Sr with different status of that project by projectId
                function(callback) {
                    //function to pass projectId to the countSrStatus in Sr controller 
                    //@RuchiDhami
                    srStatus.countSrStatus(ProjectId, function(result) {

                        var items ={};
                        items.label = _.keys(result)
                        items.data = _.values(result)

                        projectJSON = JSON.parse(JSON.stringify(project));
                        projectJSON.projectstatus = items;
                        callback();
                    });
                }
            ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
                if (err) return next(err);

                return res.json(projectJSON);
            });
        });

        // do something error-prone
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateProject
 Description: Controller to update project details by its project ID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.updateProject = function(req, res) {
    trycatch(function() {    
        // find project by project ID and update its detail 
        
        Project.findOneAndUpdate({
            '_id': req.params.projectId
        }, req.body, function(err, project) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(project);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })

}

/*----------------------------------------------------------------------------------------------------
 Name: getProjectListNames
 Description: Controller to get project's Titles of customer/ domain
 Author: SubinJoshi
 Date : 12 Aug 2015

 Date   Author Version Description
 ------------------------------------------------------------------------
 10/09/2015 subin v1 Controller to get project's Titles of customer/ domain  
 18/09/2015 rikesh  v1.1 conditions added to return only those projects to non-admin users in which they are involved
------------------------------------------------------------------------------------------------------*/
exports.getProjectListNames = function(req, res) {
    trycatch(function() {   
        // find projects of customer by customer's ID    
    
        if (req.user.app_users.role == 'admin') {
            Project.find({
                'customerId': req.params.customerId
            }, {
                _id: true,
                project_title: true
            }).exec(function(err, projects) {
                var value = [];
                //asynchronous loop to append counted Sr status value in project detail according to projectID for admin @RuchiDhami
                function asycnchronous(i) {
                    if (i < projects.length) {
                //function to call the countSrStatus in Sr controller @RuchiDhami
                        srStatus.countSrStatus(projects[i]._id, function(result) {
                            var items ={};
                            items.label = _.keys(result)
                            items.data = _.values(result)
                            var projectdata = JSON.parse(JSON.stringify(projects[i]));
                            projectdata.projectStatus= items
                            value.push(projectdata);
                            asycnchronous(i + 1);
                        });
                    } else {
                        res.send(value);
                    }
                }
                asycnchronous(0)
            })
        } else if (req.user.app_users.role == 'user') {
            Project.find({
                'customerId': req.user.customerId,
                'members.user_id': req.user.app_users._id
            }, {
                _id: true,
                project_title: true
            }).exec(function(err, projects) {
                var value = [];
                //asynchronous loop to append counted Sr status value in project detail according to projectID for admin @RuchiDhami
                function asycnchronous(i) {
                    if (i < projects.length) {
                        //function to call the countSrStatus in Sr controller @RuchiDhami
                        srStatus.countSrStatus(projects[i]._id, function(result) {
                            var items = {};
                            items.label = _.keys(result)
                            items.data = _.values(result)
                            var projectdata = JSON.parse(JSON.stringify(projects[i]));
                            projectdata.projectStatus = items
                            value.push(projectdata);
                            asycnchronous(i + 1);
                        });
                    } else {
                        res.send(value);
                    }
                }
                asycnchronous(0)
            })
        }
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateMemberRole
 Description: Controller to assign member role in project
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.updateMemberRole = function(req, res) {
    trycatch(function() {
        Project.update({
            'members._id': mongoose.Types.ObjectId(req.params.projectId)
        }, {
            '$set': {
                'members.$.group_name': req.body.group_name
            }
        },
        { upsert: true },
         function(err, project) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!project) {
                return res.send(404);
            }
            return res.json(project);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })

}


/*----------------------------------------------------------------------------------------------------
 Name: getNextNumber
 Description: Controller to update the SrId_counter in project collections
 Author: RikeshBhansari
------------------------------------------------------------------------------------------------------*/
exports.getNextNumber = function(projectId,callback) {
    trycatch(function() {
        Project.findOneAndUpdate({
                _id: projectId
            }, {
                $inc: {
                    srId_counter: 1
                }
            }, {
                new: true
            },
            function(err, project) {
                if (err) {
                    console.log(err.stack);
                    console.log(err.message);
                    return handleError(res, err);
                }
                // console.log("count: ", project);
                return callback(project.srId_counter);
            }
        );
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: setAdmin
 Description: Controller to set one of the group members as admin.
 Author: RikeshBhansari
------------------------------------------------------------------------------------------------------*/
exports.setAdmin = function(req, res) {
    //console.log(req.body);
    trycatch(function() {
        var projectId = req.body.projectId;
        var user_id = req.body.user_id;
        Project.findById(
            projectId, function(err, doc) {
            if(err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            //console.log(doc);
            if(doc) {
                if(doc.members.length>0) {
                    async.each(doc.members,
                        function(member, callback) {
                            if(member.user_id == user_id) {
                                member.isAdmin = true;
                            } else {
                                member.isAdmin = false;
                            }
                            callback();
                        },
                        function() {
                            Project.findOneAndUpdate({
                                _id: projectId
                            }, {
                                members: doc.members
                            },
                            function(err, project) {
                                if (err) {
                                    console.log(err.stack);
                                    console.log(err.message);
                                    return handleError(res, err);
                                }
                                if(!project) {
                                    return res.send(400);
                                }
                                return res.send(project);
                            });
                        }
                    );
                }
            }
            if(!doc) {
                return res.send(400);
            }
        });

    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getUserPermissionInProject
 Description: gets all permission of loggedIn users for that selected project
 Author: Prasanna Shrestha
 created: 12/23/2015
------------------------------------------------------------------------------------------------------*/

exports.getUserPermissionInProject = function(req, res) {
    trycatch(function() {
        var user_id = req.user.app_users._id;
        console.log("Login User :: ",user_id);
        console.log("Project Id :: ",req.params.projectId);
        Project.aggregate({
            '$unwind': '$members'
        }, {
            '$match': {
                '_id': mongoose.Types.ObjectId(req.params.projectId),
                'members.user_id': user_id.toString()         
            }
        }, {
            "$project": {               
                'members.group_name': 1,
                'members.user_id': 1,
                'members.isAdmin': 1
            }
        }, function(err, result) {
            //get role details by group id of that member
            console.log("Member role Id :: ",result);
            if(result.length && result.length > 0){
                Role.find({'_id':mongoose.Types.ObjectId(result[0].members.group_name)}, function(err, role) {
                    if (err) {
                        return handleError(res, err);
                    }
                    if (!role) {
                        return res.send(404);
                    } 
                    console.log("Role :: ",role);      
                    if(role.length > 0){      
                        var roleData = JSON.parse(JSON.stringify(role));
                        roleData[0].isAdmin = result[0].members.isAdmin;  
                        console.log("member Role :: ",roleData);
                        res.send(roleData);
                    }else{
                        console.log("Role 2 :: ",role);      
                        res.send(role);
                    }
                });
            }else{
                res.send(result);
            }
            
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      res.status(500).send({status:"error", message: err.message});
    })
}   

function handleError(res, err) {
    return res.send(500, err);
}