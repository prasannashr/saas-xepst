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
    mongoose = require('mongoose');


/*----------------------------------------------------------------------------------------------------
 Name: createRole
 Description: Create new role 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/

exports.createRole = function(req, res) {
    Role.create(req.body, function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(role);
    });
};


/*----------------------------------------------------------------------------------------------------
 Name: getAllRoles
 Description: Controller to get all roles 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/

exports.getAllRoles = function(req, res) {
    
    Role.find(function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, role);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: getRoleDetail
 Description: Controller get role detail by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.getRoleDetail = function(req, res) {
    /** 
    find one role detail by role ID  
    **/
    Role.findById(req.params.roleId, function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        if (!role) {
            return res.send(404);
        }       
        return res.json(role);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: updateRoleGroup
 Description: controller to update role by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.updateRoleGroup = function(req, res) {
    /** 
    find role by role ID and update role detail 
    **/
    Role.findOneAndUpdate({
        '_id': req.params.roleId
    }, req.body, function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(role);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteRoleGroup
 Description: controller to delete role by role ID 
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.deleteRoleGroup = function(req, res) {
    /** 
    find role by role ID in role collection 
    **/
    Role.findById(req.params.roleId, function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        if (!role) {
            return res.send(404);
        }
        /** 
        remove role matching from role ID 
        **/
        role.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(role);
        });
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: getRoleList
 Description: controller to get all roles
 Author: SubinJoshi
 Date : 20 Aug 2015 
------------------------------------------------------------------------------------------------------*/
exports.getRoleList = function(req, res){

     Role.find(function(err, role) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, role);
    });
}

function handleError(res, err) {
    return res.send(500, err);
}


