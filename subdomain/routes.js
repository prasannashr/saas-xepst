var auth = require('./server/config/auth'),
    users = require('./server/controllers/users'),
    projects = require('./server/controllers/projects'),
    sr = require('./server/controllers/sr'),
    roles = require('./server/controllers/roles'),
    search = require('./server/controllers/search'),
    languages = require('./server/controllers/languages'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    User = mongoose.model('User'),
    multer = require('multer');

/*----------------------------------------------------------------------------------------------
  Name: makeDirIfNotExist
  Description: checks if a folder exits to upload a file in, creates one if does not exist.
  Author: Rikesh Bhansari
  Created: 2015/10/28
 ------------------------------------------------------------------------------------------------*/
makeDirIfNotExist = function(newDestination) {
    try {
           var stat = fs.statSync(newDestination);
        } catch (err) {
            fs.mkdirSync(newDestination);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        return newDestination;
}

/*----------------------------------------------------------------------------------------------
  Name: upload
  Description: manages upload destination and file renaming; provided by multer
  Author: Rikesh Bhansari
  Created: 2015/10/28
 ------------------------------------------------------------------------------------------------*/
var upload = multer({dest: './public/uploads',
    limits: {
        fieldNameSize: 100,
        fileSize: 5*1024*1024,
        files: 1,
        fields: 1
    },
    changeDest: function(dest, req, res) {
        var newDestination = dest + '/' +  req.user.customerId;
        var stat = null;
        newDestination = makeDirIfNotExist(newDestination);

        if(req.query.projectId) {
            newDestination = newDestination + '/' +  req.query.projectId;
            stat = null;
            newDestination = makeDirIfNotExist(newDestination);
        }

        if(req.query.userId) {
            newDestination = newDestination + '/profilePic';
            stat = null;
            newDestination = makeDirIfNotExist(newDestination);
        }

        return newDestination;
    },
    rename: function (fieldname, filename, req) {
        console.log(fieldname, 'FIELDNAME');
        if(fieldname == 'logo') {
            return filename = 'logo';
        }
        else if(fieldname == 'profilePic') {
            return filename=req.user.app_users._id;
        }
        else return filename+'_'+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is uploading ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});



module.exports = function(app) {

    app.get('/auth/verifycustomer', auth.verifyCustomer);
    //file upload using multer
    app.post('/api/upload', upload, sr.uploadFile);
    /*----------------------------------------------------------------------------------------------------
     Description: routes used for customers and users 
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    //app.get('/api/users', auth.requiresRole('admin'), users.getUsers);
    app.get('/api/users', users.getUsers);
    app.post('/api/createCustomer', users.createCustomer); /** route to create Customer when sign up **/
    app.post('/api/users/addUser', users.addUser); /** route to add new user by Customer in add user form **/
    app.post('/api/customerUsers', users.getCustomerUsers); /** route to get customer's user lists **/
    app.put('/api/updateOrganization/:customerId', users.updateOrganization); /** route to create Customer organization @RuchiDhami**/
    app.post('/api/updateLanguageEditOption/:customerId', users.updateLanguageEditOption);
    app.put('/api/updateResolutionType/:customerId', users.updateResolutionType);
    app.post('/api/updateMaxAttachment/:customerId', users.updateMaxAttachment);
    app.post('/api/updateMaxPriority/:customerId', users.updateMaxPriority);
    app.post('/api/getOrganization/:customerId', users.getOrganization); /**route to get the organization details @RuchiDhami**/
    
    /*----------------------------------------------------------------------------------------------------
     Description: routes used for customer's Resolution Types CRUD operation
     Author: Prasanna Shrestha
     Date : 16/10/2015
    ------------------------------------------------------------------------------------------------------*/
    app.get('/api/resolutionType/:customerId', users.getResolutionTypes); // get all resolution Types
    app.post('/api/resolutionType/:customerId', users.addResolutionType); // add new resolution Type
    app.put('/api/resolutionType/:typeId', users.updateResolutionTypeName); // update resolution Type by type id
    app.delete('/api/resolutionType/:typeId', users.deleteResolutionType);  // delete resolution Type by type id  

    /**route to get totalnumber of  customer's user list @RuchiDhami**/
    app.post('/api/totalCustomerUsers/:customerId', users.getTotalCustomerUsers);
    app.get('/api/priorities', users.getSRPriorities); /** route to get user's SR priorities List**/
    app.put('/api/priorities/:priorityId', users.updateSRPriorities); /** route to get user's SR priorities List**/

    /** route to get customer's user lists **/
    app.get('/api/customerUsers/name', users.getCustomerUsersName); /** route to get user's fullname **/
    app.put('/api/users/:userId', users.updateUserProfile); /** update user profile**/
    app.get('/api/getUserDetail/:userId', users.getUserDetail); /** route to get user detail bi user Id **/
    app.delete('/api/deleteUser/:deleteUserId', users.deleteCustomerUser); /** route to delete user by User Id **/
    app.put('/api/updateCustomerUser/:userId', users.updateCustomerUser); /** Update user by customer by userId **/
    app.post('/checkCurrentPassword', users.checkCurrentPassword); /*route to check currentpassword in database @RuchiDhami*/
    app.put('/edit/:id', users.editPassword); /*route to edit Oldpassword @RuchiDhami*/

    app.put('/api/updateLoginUser', users.updateLoginUser) /*route to update the loginUser @RuchiDhami*/
    app.post('/api/checkEmailForUser/:customerId', users.checkEmailForUser) /**route to check if email exist for the user @RuchiDhami**/
    app.put('/api/addSRType/:customerId',users.addSRType); /**add sr type @RuchiDhami**/
    app.get('/api/getSrType/:customerId',users.getSrTypeAndStatus); /**find the added SrType and SrStatus @RuchiDhami**/
    app.delete('/api/deleteSrType/:typeId',users.deleteSrType); /** delete type of Sr by id @RuchiDhami**/
    app.put('/api/updateSrType/:typeId',users.updateSrType); /**update Sr type by its Id @RuchiDhami**/
    app.put('/api/updateSrStatus/:srStatusId',users.updateSrStatus); /**update Sr Status value by its id @RuchiDhami**/
    app.get('/api/checkSrStatusUsed/:srStatusId',sr.checkSrStatusUsed); /**check Sr Status used in any SR or not by its id @Prasanna**/

    /*----------------------------------------------------------------------------------------------------
     Description: routes used for projects
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    app.post('/api/createProject/:customerId', projects.createProject); /** route to create new project by Customer **/
    app.get('/api/getProjectList/:customerId', projects.getProjectList); /** route to get project list under customer **/
    app.get('/api/getProjectDetail/:projectId', projects.getProjectDetail);
    /** route to get project Detail by projectId **/
    app.delete('/api/deleteProject/:projectId', projects.deleteProject); /** route to delete project by projectId  **/
    app.put('/api/updateProject/:projectId', projects.updateProject); /** route to update project by project ID **/
    app.get('/api/getProjectListNames/:customerId', projects.getProjectListNames);
    //app.get('/api/getProjectMembers/:projectId', projects.getProjectMembersName);
    app.put('/api/updateMemberRole/:projectId', projects.updateMemberRole); /** update member role by project ID **/

    /*----------------------------------------------------------------------------------------------------
     Description: routes used for SR
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    app.post('/api/createNewSr/:projectId', sr.createNewSr); /** route to create New Task in project **/
    app.get('/api/getSRlists/:projectId', sr.getSrLists); /** routes to get Task Lists by project ID **/
    app.get('/api/getSrDetail/:srId', sr.getSrDetail); /** routes to get Task/SR Detail by SR ID  **/
    app.put('/api/updateSrDetail/:srId', sr.updateSrDetail); /** route to update task/SR detail by SR ID **/
    app.get('/api/getAllSr', sr.getAllSr); /** route to get all SR **/
    app.post('/api/addNewComment/:srId', sr.addNewComment) /** add new comment to SR **/
    app.put('/api/updateSrComment/:commentId', sr.updateSrComment); /** update Sr Comment @subinjoshi - 25 August 2015 **/
    // app.delete('/api/deleteSrComment/:commentId', sr.deleteSrComment) /** delete SR comment by comment ID @subinjoshi - 25 August 2015 **/
    //app.post('/api/uploadFile', sr.uploadFile);
    app.put('/api/updatePriority/:srId', sr.updatePriority); /** updatePriority of Sr @RuchiDhami **/
    app.put('/api/setProgressbar/:srId', sr.setProgressBar); /** update Sr progressBar @RuchiDhami **/
    app.put('/api/updateSrElement/:srId', sr.updateSrElement); /** update one element of SR at a time @rikeshBhansari - 24 Sept 2015**/
    app.get('/api/getUserName/:creatorId', users.getUserName);  /** gets the full name of user by its ID @rikeshBhansari - 24 Sept 2015 **/   
    app.post('/api/countTotalSr/:projectId', sr.countTotalSr); /** count total number of Sr @RuchiDhami**/
    app.get('/api/getSrStatus/:customerId',sr.getSrStatus);/** get Sr status of customer from the database whose value is true @RuchiDhami**/


    /*----------------------------------------------------------------------------------------------------
      Description: routes used for Roles
      Author: SubinJoshi    
     ------------------------------------------------------------------------------------------------------*/
    app.post('/api/createRole', roles.createRole); /** route to create new role **/
    app.get('/api/getAllRoles', roles.getAllRoles); /** route to get all roles **/
    app.get('/api/getRoleDetail/:roleId', roles.getRoleDetail); /** route to get role detail by role ID **/
    app.get('/api/getRoles', roles.getRoleList) /** gets roles for the assigning role in project **/
    app.put('/api/updateRoleGroup/:roleId', roles.updateRoleGroup); /** route to update role by role ID **/
    app.delete('/api/deleteRoleGroup/:roleId', roles.deleteRoleGroup); /** route to delete role by role ID **/


    /*----------------------------------------------------------------------------------------------------
     Description:  routes used for multilanguage
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    app.post('/api/addNewLanguage/:customerId', languages.addNewLanguage);
    app.get('/api/getLanguageList/:customerId', languages.getLanguageList);
    //app.get('/api/getCountriesList', languages.getCountriesList);
    app.get('/api/getLanguageDetail/:languageId', languages.getLanguageDetail);
    app.put('/api/updateLanguage/:languageId', languages.updateLanguage);
    app.delete('/api/deleteLanguage/:languageId', languages.deleteLanguage);
    app.post('/api/getOneLanguage/:customerId', languages.getSelectedLanguageData);
    app.get('/api/getCustomerLanguages/:customerId', languages.getCustomerLanguages);
    app.get('/api/getLanguageCode/:customerId', languages.getLanguageCode);
    app.post('/api/findLanguageCode/:customerId', languages.findLanguageCode);
    app.put('/api/updateLabelDescription/:customerId', languages.updateLabelDescription);
    app.post('/api/createNewLabel', languages.createLabelCode);
    app.get('/api/lang/', languages.getSelectedLanguageData);
    app.get('/api/getLanguageOptions/', auth.requiresApiLogin, languages.getLanguageOptions);
    app.post('/api/checkCountry', languages.checkCountry); /**route to check the country from the database @RuchiDhami**/


    /*----------------------------------------------------------------------------------------------------
     Description:  routes used for search
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    app.post('/api/search/:customerId', search.searchData);

    // api to get login user details
    app.get('/api/login', function(req, res) {
        res.send(req.user);
    });

    app.get('/partials/*', function(req, res) {
        res.render('../../../public/app/' + req.params[0]);
    });

    app.get("/dashboard/*", ensureAuthenticated, function(req, res) {
        res.render("dashboard-new");
    });

    //app.post('/api/login', auth.authenticate, users.dashboard);

    app.post('/api/login', auth.authenticate);
    app.post('/logout', function(req, res) {
        req.logout();
        res.end();
    });

    app.get('/dashboard', ensureAuthenticated, users.dashboard);
    app.get('/', function(req, res) {
        res.redirect('/dashboard');
    });

    app.get('/login', function(req, res) {
        if (!req.isAuthenticated()) {
            res.render('login');
        } else {
            res.redirect('/dashboard');
        }
    });

    app.all('/api/*', function(req, res) {
        res.send(404);
    });

    function ensureAuthenticated(req, res, next) {

        if (!req.isAuthenticated()) {
            res.redirect('/login');
        } else {
            return next();
        }

    }
}
