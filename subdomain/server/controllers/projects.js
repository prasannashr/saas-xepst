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
    mongoose = require('mongoose');
var srStatus = require('./sr.js');
var _ = require('underscore');
var async = require("async"),
    User = require('mongoose').model('User');

/*----------------------------------------------------------------------------------------------------
 Name: createProject
 Description: controller to create new project
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.createProject = function(req, res) {

    req.body.customerId = req.params.customerId;
    req.body.project_createdDate = new Date();
    /** 
    creates new project in the project collection with form data 
    **/
    Project.create(req.body, function(err, project) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(project);
    });
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
    /** 
    find all projects by customer ID 
    **/
    Project.find({
        'customerId': req.params.customerId
    }).exec(function(err, projects) {
        res.send(projects);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteProject
 Description: controller to delete project by project ID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.deleteProject = function(req, res) {

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
}

/*----------------------------------------------------------------------------------------------------
 Name: getProjectDetail
 Description: Controller to get project Detail by its projectID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.getProjectDetail = function(req, res) {
    ProjectId = req.params.projectId;

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
}

/*----------------------------------------------------------------------------------------------------
 Name: updateProject
 Description: Controller to update project details by its project ID
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.updateProject = function(req, res) {
    /** 
    find project by project ID and update its detail 
    **/
    Project.findOneAndUpdate({
        '_id': req.params.projectId
    }, req.body, function(err, project) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(project);
    });

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
    /** 
    find projects of customer by customer's ID  
    **/
    
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
}

/*----------------------------------------------------------------------------------------------------
 Name: updateMemberRole
 Description: Controller to assign member role in project
 Author: SubinJoshi
 Date : 12 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.updateMemberRole = function(req, res) {

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
            res.send(err);
        }
        if (!project) {
            return res.send(404);
        }
        return res.json(project);
    });

}

function handleError(res, err) {
    return res.send(500, err);
}

/*----------------------------------------------------------------------------------------------------
 Name: getNextNumber
 Description: Controller to update the SrId_counter in project collections
 Author: RikeshBhansari

------------------------------------------------------------------------------------------------------*/
exports.getNextNumber = function(projectId,callback) {
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
                console.log("Something went wrong!!!");
            }
            // console.log("count: ", project);
            return callback(project.srId_counter);
        }
    );
}
