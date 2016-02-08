/*-------------------------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
---------------------------------------------------------------------------------------------------
  File        : subdomain/server/controllers/fileHandler.js
  Description : handles upload and download of files
  Input param :
  Output param:
  Author      : Rikesh Bhansari
  Created     : 10/09/2015

Date      Version   Author        Description
---------------------------------------------------------------------------------------------------
2016/01/22  v1      Rikesh Bhansari   handles upload of user profile picture, and organization logo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
----------------------------------------------------------------------------------------------------*/

var path = require('path');
var mongoose = require('mongoose');
var SR = mongoose.model('Sr');
var sr = require('../controllers/sr.js');
var users = require('../controllers/users.js');
var fs = require('fs');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('../../config/config.js')[env];

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
var gfs = Grid(conn.db);
var gm = require('gm');

/*------------------------------------------------------------------------------------------
    Name: uploadFile
    Description: function to upload user profile picture and organization logo
    Author: Rikesh Bhansari
------------------------------------------------------------------------------------------*/
exports.uploadFile = function(fieldname, file, filename, encoding, mimetype, userId, callback) {
    //console.log('inside uploadFile');
    var fileId = new mongoose.Types.ObjectId();
    var dataObject = {};
    dataObject.filename = filename;
    dataObject.path = fileId;

    var writeStream = gfs.createWriteStream({
        _id: fileId,
        root: fieldname,
        filename: filename,
        mode: 'w',
        content_type: mimetype,
        metadata: {
            status: true,
            userId: userId
        }
    });
    file.pipe(writeStream)
        .on('error', function(err) {
            callback(err);
        })
        .on('finish', function() {
            gfs.collection(fieldname).findOne({
                _id: fileId
            }, function(err, fileFound) {
                if (err) {
                    return callback(err);
                }
                if (!fileFound) {
                    return callback(404);
                }
                gfs.collection(fieldname).update({
                    'metadata.userId': userId,
                    'metadata.status': true,
                    _id: {
                        $ne: mongoose.Types.ObjectId(fileId)
                    }
                }, {
                    $set: {
                        'metadata.status': false
                    }
                }, {
                    multi: true
                }, function(err, updated) {
                    if (err) {
                        return callback(err);
                    }
                    if (!err) {
                      createThumbnails(filename, fieldname, mimetype, userId, fileId, function(err, thumbnails) {
                        if(err) {
                          callback(err);
                        }
                        if(!thumbnails) {
                          callback(404);
                        }
                        callback(null, thumbnails);
                      });
                    }
                });
            });
        });
}

/*-----------------------------------------------------------------------------------------------
    Name: createThumbnails
    Description: function to create thumbnails of uploaded profile picture and organization logo
    Author: Rikesh Bhansari
-------------------------------------------------------------------------------------------------*/
function createThumbnails(filename, fieldname, mimetype, userId, fileId, callback) {
  var collection = 'thumbnails';

  var wStream = gfs.createWriteStream({
    root: 'thumbnails',
    _id: fileId,
    filename: filename+'_thumb',
    mode: 'w',
    content_type: mimetype
  });

  var rstream = gfs.createReadStream({
    root: fieldname,
    _id: fileId
  })

  gm(rstream)
    .resize('100', '100')
    .stream(function(err, stdout, stderr) {
      console.log(err);
      stdout.pipe(wStream)
        .on('finish', function() {
          callback(null, fileId);
        });
    });
}

var getThumbnail = function(picId, callback) {
    
    gfs.collection('thumbnails').findOne({
        // "_id": picId //throws error
        "_id": mongoose.Types.ObjectId(picId)
    }, function(err, file) {

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
          var result = 'data:image/jpeg;base64,' + base64;
          callback(null, result);
        }).on('error', function(err) {
          callback(err);
        })
    });
}

/*-----------------------------------------------------------------------------------------------
    Name: createThumbnails
    Description: function to get profile picture and organization logo from database; called by passport
    Author: Rikesh Bhansari
-------------------------------------------------------------------------------------------------*/
exports.getImageThumbnail = function(picId, callback) {
    
    getThumbnail(picId, function(err, cb){
      if(err) {
        console.log(err);
        return callback(err);
      }
      if(!cb) {
        return (404);
      }
      return callback(null,cb);
    });
}

//called from angular
exports.getPictureThumbnail = function(req, res) {
  
  getThumbnail(req.params.picId, function(err, picture) {
    if(err) {
      return res.send(err);
    }
    if(!picture) {
      return res.send(404);
    }
    return res.send(picture);
  })
}