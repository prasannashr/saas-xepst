/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/controllers/search.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 prasanna Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

var User = require('mongoose').model('User'),
    Project = require('mongoose').model('Project'),
    Sr = require('mongoose').model('Sr'),
    mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');


/*----------------------------------------------------------------------------------------------------
 Name: searchData
 Description: Search in multiple collections of SR , Projects and users and returns result on matching query term
 Author: SubinJoshi
 Date : 8th Sep 2015 
------------------------------------------------------------------------------------------------------*/
exports.searchData = function(req, res) {

    var collection = ['users', 'projects', 'srs'];
    stream = Project.synchronize();
    stream2 = User.synchronize();
    stream3 = Sr.synchronize();
    var searchResultArray = [];
    var types = ['project', 'user', 'sr'];

    User.search({
            "bool": {
                "must": [{
                    "term": {
                        "customerId": req.params.customerId
                    }
                }, {
                    "multi_match": {
                        "query": req.body.queryTerm,
                        "fields": ["project_title", "sr_title", "app_users.fullname"]
                    }
                }]
            }
        }, {
            index: collection,
            type: types
        },
        // {
        //     "hydrate": true
        // },
        function(err, results) {
            if(results){
                results.hits.hits.forEach(function(error, i) {

                    if (results.hits.hits[i]._type == "sr") {
                        searchResultArray.push({
                            "title": results.hits.hits[i]._source.sr_title,
                            "id": results.hits.hits[i]._source._id,
                            "project_id": results.hits.hits[i]._source.project_id,
                            "type": "SR"
                        });
                    } else if (results.hits.hits[i]._type == "project") {
                        searchResultArray.push({
                            "title": results.hits.hits[i]._source.project_title,
                            "id": results.hits.hits[i]._source._id,
                            "type": "Project"
                        });
                    } else if (results.hits.hits[i]._type == "user") {
                        console.log('inside user');
                        console.log(results.hits.hits[i]._source.app_users);
                        console.log(results.hits.hits[i]._source.app_users.length);

                        searchResultArray.push({
                            "title": results.hits.hits[i]._source.app_users[0].fullname,
                            "id": results.hits.hits[i]._source.app_users[0]._id,
                            "type": "User"
                        });
                    }
                })
            }
            return res.json(searchResultArray);
        })
};
