/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/controllers/sr.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

var Sr = require('mongoose').model('Sr'),
    mongoose = require('mongoose'),
    projects = require('./projects.js');
var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    async = require("async"),
    Customer = require('mongoose').model('Customer'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../../../config/config.js')[env];

/*----------------------------------------------------------------------------------------------------
 Name: createNewSr
 Description: controller to create new SR by customer  
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.createNewSr = function(req, res) {
    req.body.project_id = req.params.projectId;
    req.body.sr_createdate = new Date();
    req.body.progress = 0;
    projects.getNextNumber(req.params.projectId, function(callback) {
        //converting srId from Number type to a String type and displaying a four digit number --Rikesh  --2015/10/30
        callback = "" + callback;
        var pad = "0000"
        var srId = pad.substring(0, pad.length - callback.length) + callback
        req.body.sr_id = srId;
        Sr.create(req.body, function(err, sr) {
            if (err) {
                return handleError(res, err);
            }
            Sr.synchronize();
            return res.json(sr);
        });
    });
};


/*----------------------------------------------------------------------------------------------------
 Name: getSrLists
 Description: gets All Sr List by Project ID 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/

exports.getSrLists = function(req, res) {
    /** 
    finds all SR of one project by it's project ID 
    **/
    Sr.find({
        'project_id': req.params.projectId
    }).sort({
        "_id": -1
    }).exec(function(err, sr) {
        res.send(sr);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: getSrDetail
 Description: gets SR details by SR ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getSrDetail = function(req, res) {
    /** 
    find one SR Detail by its SR ID in SR collection
    **/
    Sr.findOne({
        '_id': req.params.srId
    }).sort({
        'comment.sr_create_date': -1
    }).exec(function(err, sr) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(sr);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: updateSrDetail
 Description: Updates SR Details by SR ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateSrDetail = function(req, res) {
    /** 
    find SR by SR ID and update SR details 
    **/
    Sr.findOneAndUpdate({
        '_id': req.params.srId
    }, req.body, function(err, sr) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(sr);
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: getAllSr
 Description: Gets all Sr with sorting by latest
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getAllSr = function(req, res) {

    /**
    find all SR from sr collection 
    **/
    Sr.find().sort({
        "_id": -1
    }).exec(function(err, sr) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(sr);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: addNewComment
 Description: Add New SR comment of user
 Author: SubinJoshi
 Date : 24 Aug 2015
------------------------------------------------------------------------------------------------------*/
exports.addNewComment = function(req, res) {
    req.body.sr_create_date = new Date();
    /** 
    find sr by Id and push new comments data into comment array of SR 
    **/
    Sr.findOneAndUpdate({
        '_id': req.params.srId
    }, {
        $push: {
            'comment': {
                user_id: req.body.user_id,
                username: req.body.fullname,
                comment: req.body.comment,
                sr_create_date: req.body.sr_create_date
            }
        }
    }, function(err, sr) {
        if (err) {
            return handleError(res, err);
        }
        if (!sr) {
            return res.send(404);
        }
        return res.json(200, sr);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: updateSrComment
 Description:update SR comment 
 Author: SubinJoshi
 Date : 25 Aug 2015
 ------------------------------------------------------------------------------------------------------
 Date       Author  Description
 ------------------------------------------------------------------------------------------------------
 23/09/2015 Rikesh update/delete sr comment
 ------------------------------------------------------------------------------------------------------*/
exports.updateSrComment = function(req, res) {

    /** 
    find SR comment by comment Id and set/update new comment into it 
    **/
    if (req.body.comment != null && req.body.comment != '') {
        Sr.update({
            $and: [{
                _id: req.body.srId
            }, {
                'comment._id': mongoose.Types.ObjectId(req.params.commentId)
            }]
        }, {
            '$set': {
                'comment.$.comment': req.body.comment
            }
        }, function(err, sr) {
            if (err) {
                res.send(err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json({
                deleted: false
            });
        });
    }

    //delete comment in SR if the edited comment is empty
    else if (req.body.comment == null || req.body.comment == '') {
        Sr.update({
            _id: req.body.srId
        }, {
            $pull: {
                comment: {
                    _id: mongoose.Types.ObjectId(req.params.commentId)
                }
            }
        }, function(err, sr) {
            if (err) {
                res.send(err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json({
                deleted: true
            });
        });

    }

}

/*----------------------------------------------------------------------------------------------------
 Name: uploadFile
 Description: uploads attachment files of SR 
 Author: RikeshBhansari
 Date : 6 Oct 2015
 ------------------------------------------------------------------------------------------------------
 Date       Author  Description
 ------------------------------------------------------------------------------------------------------
 2015/11/05 Rikesh conditional execution for single/multiple upload
 ------------------------------------------------------------------------------------------------------*/

//string manipulation to remove 'public' from path  --2015/11/05
 var pathManipulate = function(path, next) {
    path = path.split('\\');
    path = path.slice(1);
    path = path.join('\\');
    next(null, path);
 }

exports.uploadFile = function(req, res) {
    if(req.files['file[file]']) {
        console.log(req.files['file[file]'].path, 'path from sr.js');
        console.log(req.files, 'path from sr.js');
        pathManipulate(req.files['file[file]'].path, function(err, newPath) {
            if(err || !newPath) {
                return res.send(err);
            } else {
                return res.send({path: newPath, filename: req.files['file[file]'].originalname});
            }
        });
    }

    //for sigle file upload after sr has been created from the sr-detail page   --2015/11/05
    if(req.files.file) {
        if(!req.query.srId) {
            console.log(req.files.file.path, 'path from sr.js');
            return 'srId not available.';        
        }
        else if(req.query.srId) {
            pathManipulate(req.files.file.path, function(err, newPath){
                if(err) {
                    console.log(err);
                    return res.send("Error while uploading");
                } else if(!newPath) {
                    return res.send("Error getting uploaded path");
                }
                else {    
                    var attach = {};
                    attach.path = newPath;
                    attach.description = req.body.desc;
                    attach.filename = req.files.file.originalname;
                    attach.uploaded_date = new Date();
                    attach.uploaded_by = req.user.app_users._id;
                    Sr.findByIdAndUpdate(
                        req.query.srId, {
                            $push: {
                                "attachments": attach
                            }
                        }, {
                            safe: true,
                            upsert: true,
                            new: true
                        },
                        function(err, model) {
                            console.log(err);
                            console.log(model);
                        }
                    );
                    return res.send(attach);
                }
            });
        }
    }
    if(req.files.logo) {
        pathManipulate(req.files.logo.path, function(err, newPath){
            if(err) {
                console.log(err);
                return res.send(err);
            } else if(!newPath) {
                return res.send("Error getting uploaded path");
            }
            else {
                return res.send({path:newPath});
            }
        });        
    }
    if(req.files.profilePic) {
        pathManipulate(req.files.profilePic.path, function(err, newPath){
            if(err) {
                console.log(err);
                return res.send(err);
            } else if(!newPath) {
                return res.send("Error getting uploaded path");
            }
            else {
                return res.send({path:newPath});
            }
        });
    }
}  

    
/*----------------------------------------------------------------------------------------------------
 Name: updateSrElement
 Description:update SR elements like assignee, title, description, and status
 Author: SubinJoshi
 Date : 25 Aug 2015
 ------------------------------------------------------------------------------------------------------
 Date       Author  Description
 ------------------------------------------------------------------------------------------------------
 23/09/2015 Rikesh update sr elements
 ------------------------------------------------------------------------------------------------------*/
exports.updateSrElement = function(req, res) {

    var key = req.body.key,
        value = req.body.value,
        data = {};
    data[key] = value;

    Sr.update({
        '_id': mongoose.Types.ObjectId(req.params.srId)
    }, {
        '$set': data
    }, function(err, sr) {
        if (err) {
            res.send(err);
        }
        if (!sr) {
            return res.send(404);
        }
        return res.json(sr);
    });

}
/*---------------------------------------------------------------------------
    Name: updatepriority
    Description:update Sr priority value in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.updatePriority = function(req, res) {
        //console.log(req.params.srId);
        Sr.update({
            '_id': mongoose.Types.ObjectId(req.params.srId)
        }, {
            '$set': {
                'priority': req.body.priority
            }
        }, function(err, sr) {
            if (err) {
                res.send(err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json(sr);
        });
    }

/*---------------------------------------------------------------------------
    Name: setProgressBar
    Description: update Sr progressbar value in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.setProgressBar = function(req, res) {
    Sr.update({
        '_id': mongoose.Types.ObjectId(req.params.srId)
    }, {
        '$set': {
            'progress': req.body.progress
        }
    }, function(err, sr) {
        if (err) {
            res.send(err);
        }
        if (!sr) {
            return res.send(404);
        }
        return res.json(sr);
    });
}

/*---------------------------------------------------------------------------
    Name: countTotalSr
    Description: count total number of Sr by project Id 
    Author: RuchiDhami
----------------------------------------------------------------------------*/
exports.countTotalSr = function(req, res) {
    Sr.count({
        'project_id': req.params.projectId
    }, function(err, countSr) {
        if (err) {
            res.send(err);
        }
        res.send({
            data: countSr
        });
    })
}

/*---------------------------------------------------------------------------
    Name: countSrStatus
    Description: count Sr status value according to key 
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.countSrStatus = function(ProjectId, callback) {
    //var status = ['New', 'Open', 'Waiting for Info', 'On Hold', 'In Progress', 'Resolved'];
    var status = config.sr_status;
    var projectStatus = {};

    function asyncLoop(i) {
        if (i < status.length) {
            Sr.count({
                'project_id': ProjectId,
                'sr_status': status[i].order
            }).exec(function(err, result) {
                projectStatus[status[i].name] = result;
                asyncLoop(i + 1);
            });
        } else {
            return callback(projectStatus);
        }
    }
    asyncLoop(0)
}

/*---------------------------------------------------------------------------
    Name: getSrStatus
    Description: find sr_status of customer from the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/
exports.getSrStatus = function(req, res) {
    Customer.aggregate({
        '$unwind': '$setting.sr_status'
    }, {
        "$match": {
            $and: [{
                '_id': mongoose.Types.ObjectId(req.params.customerId)
            }, {
                'setting.sr_status.value': true
            }]

        }
    }, {
        $project: {
            'setting.sr_status': true
        }
    }).exec(function(err, result) {
           res.send(result);

    })
}

/*----------------------------------------------------------------------------------------------------
 Name: checkSrStatusUsed
 Description: check Sr status used or not in any SR by its id 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.checkSrStatusUsed = function(req, res) {
    console.log(req.user,"--------------");
    console.log(req.params.srStatusId,"--------------");
    Sr.count({
        'customerId': "561b638feebdd33046b4cc3a",
        'sr_status': req.params.srStatusId
    },
    function(err, result) {
        console.log(result);
        return res.json(result)
    });
}

function handleError(res, err) {
    return res.send(500, err);
}