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
    projects = require('./projects.js'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    async = require("async"),
    Customer = require('mongoose').model('Customer'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../../config/config.js')[env],
    trycatch = require('trycatch');
var Busboy = require('busboy');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
var gfs = Grid(conn.db);
// var fileHandler = require('../utilities/fileHandler.js');

/*----------------------------------------------------------------------------------------------------
 Name: createNewSr
 Description: controller to create new SR by customer  
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.createNewSr = function(req, res) {
    req.body.project_id = req.params.projectId;
    req.body.sr_createdate = new Date();
    req.body.progress = 0;
    trycatch(function() {
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
                console.log(sr);
                return res.json(sr);
            });
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};


/*----------------------------------------------------------------------------------------------------
 Name: getSrLists
 Description: gets All Sr List by Project ID 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/

exports.getSrLists = function(req, res) {
    
    // finds all SR of one project by it's project ID 
    trycatch(function() {
        Sr.find({
            'project_id': req.params.projectId
        }).sort({
            "_id": -1
        }).exec(function(err, sr) {
            res.send(sr);
        })
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: getSrDetail
 Description: gets SR details by SR ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getSrDetail = function(req, res) {
   
    // find one SR Detail by its SR ID in SR collection   
    trycatch(function() {
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: updateSrDetail
 Description: Updates SR Details by SR ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateSrDetail = function(req, res) {
    
    // find SR by SR ID and update SR details     
    trycatch(function() {
        Sr.findOneAndUpdate({
            '_id': req.params.srId
        }, req.body, function(err, sr) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(sr);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })

}


/*----------------------------------------------------------------------------------------------------
 Name: getAllSr
 Description: Gets all Sr with sorting by latest
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getAllSr = function(req, res) {

    
    // find all SR from sr collection 
    trycatch(function() {
        Sr.find().sort({
            "_id": -1
        }).exec(function(err, sr) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(sr);
        })
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
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
   
    // find sr by Id and push new comments data into comment array of SR 
    trycatch(function() {   
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
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

    
    // find SR comment by comment Id and set/update new comment into it 
    trycatch(function() {  
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })

}

//get profile picture from database
exports.getProfilePic = function(req, res) {
    console.log(req.params.picId,"here");

    gfs.collection('fs').findOne({
        "_id": mongoose.Types.ObjectId(req.params.picId)
    }, function(err, file) {
        console.log(file);

        var filename = file.filename;
        var rstream = gfs.createReadStream({
            filename: file.filename
        })
        var bufs = [];

        rstream.on('data', function(chunk) {

            bufs.push(chunk);

        }).on('end', function() { // done

            var fbuf = Buffer.concat(bufs);

            var base64 = (fbuf.toString('base64'));

            res.send('data:image/jpeg;base64,' + base64 );
        });
    });

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
    trycatch(function() {
        Sr.update({
            '_id': mongoose.Types.ObjectId(req.params.srId)
        }, {
            '$set': data
        }, function(err, sr) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json(sr);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })

}
/*---------------------------------------------------------------------------
    Name: updatepriority
    Description:update Sr priority value in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.updatePriority = function(req, res) {
    trycatch(function() {
        Sr.update({
            '_id': mongoose.Types.ObjectId(req.params.srId)
        }, {
            '$set': {
                'priority': req.body.priority
            }
        }, function(err, sr) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json(sr);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*---------------------------------------------------------------------------
    Name: setProgressBar
    Description: update Sr progressbar value in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.setProgressBar = function(req, res) {
    trycatch(function() {
        Sr.update({
            '_id': mongoose.Types.ObjectId(req.params.srId)
        }, {
            '$set': {
                'progress': req.body.progress
            }
        }, function(err, sr) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!sr) {
                return res.send(404);
            }
            return res.json(sr);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*---------------------------------------------------------------------------
    Name: countTotalSr
    Description: count total number of Sr by project Id 
    Author: RuchiDhami
----------------------------------------------------------------------------*/
exports.countTotalSr = function(req, res) {
    trycatch(function() {
        Sr.count({
            'project_id': req.params.projectId
        }, function(err, countSr) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            res.send({
                data: countSr
            });
        })
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
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
    trycatch(function() {
        function asyncLoop(i) {
            if (i < status.length) {
                Sr.count({
                    'project_id': ProjectId,
                    'sr_status': status[i].order
                }).exec(function(err, result) {
                    if (err) {
                        console.log(err.stack);
                        console.log(err.message);
                        return handleError(res, err);
                    }
                    projectStatus[status[i].name] = result;
                    asyncLoop(i + 1);
                });
            } else {
                return callback(projectStatus);
            }
        }
        asyncLoop(0)
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*---------------------------------------------------------------------------
    Name: getSrStatus
    Description: find sr_status of customer from the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/
exports.getSrStatus = function(req, res) {
    trycatch(function() {
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
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            res.send(result);

        })

    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
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
    trycatch(function() {
        Sr.count({
            'customerId': req.user.customerId,
            'sr_status': req.params.srStatusId
        },
        function(err, result) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            console.log(result);
            return res.json(result)
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: uploadSingleAttachment
 Description: uploads file into database using gridfs
 Author: Rikesh Bhansari
 Date: 2016/01/21
------------------------------------------------------------------------------------------------------*/
exports.uploadSingleAttachment = function(req, res) {
    var busboy = new Busboy({headers: req.headers});
    req.pipe(busboy);
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        fieldname = 'attachments';
        var fileId = new mongoose.Types.ObjectId();
        var dataObject = {};
        dataObject.filename = filename;
        dataObject.path = fileId;
        var writeStream = gfs.createWriteStream({
            root: fieldname,
            _id: fileId,
            filename: filename,
            mode: 'w',
            content_type: mimetype,
        });
        file.pipe(writeStream)
            .on('error', function(err) {
                return res.send(err);
            });
        busboy.on('field', function(fieldname, value) {
            dataObject.description = value;
        });
        busboy.on('finish', function() {
            dataObject.uploaded_date = new Date();
            dataObject.uploaded_by = req.user.app_users._id;
            if (req.query.srId) {
                Sr.findByIdAndUpdate(
                    req.query.srId, {
                        $push: {
                            "attachments": dataObject
                        }
                    }, {
                        safe: true,
                        upsert: true,
                        new: true
                    },
                    function(err, model) {
                        if (err) {
                            console.log(err);
                        }
                        //returns entire sr document
                        return res.send(model);
                    }
                );
            } else {
                console.log(dataObject);
                //returns attachment details
                return res.send(dataObject);
            }
        });
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: downloadFile
 Description: downloads attachment from database
 Author: Rikesh Bhansari
 Date: 2016/01/21
------------------------------------------------------------------------------------------------------*/
exports.downloadFile = function(req, res) {
    console.log(req.params.fileId,"fileId");
    gfs.collection('attachments').findOne({
        _id: mongoose.Types.ObjectId(req.params.fileId)
    }, function(err, file) {
        if (err) return res.status(400).send(err);
        if (!file) return res.status(404).send('');
        console.log(file);
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

        var readstream = gfs.createReadStream({
            _id: mongoose.Types.ObjectId(file._id)
        });

        readstream.on("error", function(err) {
            console.log("Got error while processing stream " + err.message);
            res.end();
        });

        readstream.pipe(res);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: openFile
 Description: opens attachment from database in browser 
 Author: Rikesh Bhansari
 Date: 2016/01/21
------------------------------------------------------------------------------------------------------*/
exports.openFile = function(req, res) {
    console.log('here in openFile');
    gfs.collection('attachments').findOne({
        "_id": mongoose.Types.ObjectId(req.params.fileId)
    }, function(err, file) {
        console.log(file)
        if (file != null) {
            var rstream = gfs.createReadStream({
                filename: file.filename
            }).pipe(res)

        } else {
            var response = {
                'msgType': "error",
                "msg": "error",
                'bufferData': "File not found"
            };
            res.send(response);
        }
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: saveSelectedChildStatus
 Description: check Sr status used or not in any SR by its id 
 Author: Prasanna Shrestha
 Date: 2016/01/28
------------------------------------------------------------------------------------------------------*/
exports.saveSelectedChildStatus = function(req, res) {
    //console.log(req.user.customerId);
    //console.log(req.params.srStatusId);
    //console.log(req.body);
    trycatch(function() {
        Customer.update({
            '_id': mongoose.Types.ObjectId(req.user.customerId),
            'setting.sr_status._id': mongoose.Types.ObjectId(req.params.srStatusId)            
        },
        { $set: { 
            'setting.sr_status.$.relatedStatus' : req.body  
            } 
        }, 
        function(err, result) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            console.log(result);
            return res.json(result)
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: saveSelectedChildStatus
 Description: check Sr status used or not in any SR by its id 
 Author: Prasanna Shrestha
 Date: 2016/01/28
------------------------------------------------------------------------------------------------------*/
exports.getRelatedStatus = function(req, res) {
    console.log(req.user.customerId);
    console.log(req.params.srStatusId);
    //console.log(req.body);
    trycatch(function() {
        Customer.aggregate({
            '$unwind': '$setting.sr_status'
        }, {
            "$match": {
                $and: [{
                    '_id': mongoose.Types.ObjectId(req.user.customerId)
                },{
                   'setting.sr_status._id': mongoose.Types.ObjectId(req.params.srStatusId)
                }]
            }
        }, {
            $project: {
                'setting.sr_status.relatedStatus': true
            }
        }, 
        function(err, result) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if(!result){
                res.json(404)
            }
            console.log(result);
            //console.log(result[0].setting.sr_status.relatedStatus);
            return res.json(result[0].setting.sr_status.relatedStatus)
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

function handleError(res, err) {
    return res.send(500, err);
}