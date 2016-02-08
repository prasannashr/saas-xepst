/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/controllers/roles.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

var Role = require('mongoose').model('Role'),
    mongoose = require('mongoose'),
    trycatch = require('trycatch');


/*----------------------------------------------------------------------------------------------------
 Name: createRole
 Description: Create new role 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/

exports.createRole = function(req, res) {
    trycatch(function() {
        Role.create(req.body, function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(role);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
};


/*----------------------------------------------------------------------------------------------------
 Name: getAllRoles
 Description: Controller to get all roles 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/

exports.getAllRoles = function(req, res) {
    trycatch(function() {
        Role.find({'customerId': req.params.customerId},function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            //console.log(role);
            return res.json(200, role);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getRoleDetail
 Description: Controller get role detail by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.getRoleDetail = function(req, res) {
    
    //find one role detail by role ID      
    trycatch(function() {
        Role.findById(req.params.roleId, function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            if (!role) {
                return res.send(404);
            }       
            return res.json(role);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateRoleGroup
 Description: controller to update role by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.updateRoleGroup = function(req, res) {
    
    //find role by role ID and update role detail 
    trycatch(function() {
        Role.findOneAndUpdate({
            '_id': req.params.roleId
        }, req.body, function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(role);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteRoleGroup
 Description: controller to delete role by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.deleteRoleGroup = function(req, res) {
    
    // find role by role ID in role collection     
    trycatch(function() {
        Role.findById(req.params.roleId, function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            if (!role) {
                return res.send(404);
            }
            
            // remove role matching from role ID             
            role.remove(function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json(role);
            });
        });

    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getRoleList
 Description: controller to get all roles
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.getRoleList = function(req, res){
    trycatch(function() {
        Role.find({'customerId': req.user.customerId},function(err, role) {
        //Role.find(function(err, role) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, role);
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


