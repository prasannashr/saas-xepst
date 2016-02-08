var auth = require('./config/auth'),
    users = require('./controllers/users'),
    projects = require('./controllers/projects'),
    sr = require('./controllers/sr'),
    roles = require('./controllers/roles'),
    search = require('./controllers/search'),
    languages = require('./controllers/languages'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    User = mongoose.model('User'),
    fileHandler = require('./utilities/fileHandler.js');



module.exports = function(app) {

    app.get('/auth/verifycustomer', auth.verifyCustomer);
    // app.post('/api/upload', upload, sr.uploadFile);
    app.post('/api/uploadProfilePic', users.uploadProfilePic);
    app.post('/api/uploadSingleAttachment', sr.uploadSingleAttachment);
    app.post('/api/uploadLogo', users.uploadLogo);

    app.get('/api/getPictureThumbnail/:picId', fileHandler.getPictureThumbnail);
    app.get('/api/downloadFile/:fileId', sr.downloadFile);
    app.get('/api/openFile/:fileId', sr.openFile);
    /*----------------------------------------------------------------------------------------------------
     Description: routes used for customers and users 
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    //app.get('/api/users', auth.requiresRole('admin'), users.getUsers);
    app.get('/api/users', auth.requiresApiLogin, users.getUsers);
    app.post('/api/createCustomer', auth.requiresApiLogin, users.createCustomer); /** route to create Customer when sign up **/
    app.post('/api/users/addUser', auth.requiresRole('admin'), users.addUser); /** route to add new user by Customer in add user form **/
    app.post('/api/customerUsers', users.getCustomerUsers); /** route to get customer's user lists **/
    app.put('/api/updateOrganization/:customerId', auth.requiresRole('admin'), users.updateOrganization); /** route to create Customer organization @RuchiDhami**/
    app.post('/api/updateLanguageEditOption/:customerId', auth.requiresRole('admin'), users.updateLanguageEditOption);
    app.put('/api/updateResolutionType/:customerId', auth.requiresRole('admin'), users.updateResolutionType);
    app.post('/api/updateMaxAttachment/:customerId', auth.requiresRole('admin'), users.updateMaxAttachment);
    app.post('/api/updateMaxPriority/:customerId', auth.requiresRole('admin'), users.updateMaxPriority);
    app.post('/api/getOrganization/:customerId', auth.requiresApiLogin, users.getOrganization); /**route to get the organization details @RuchiDhami**/
    
    /*----------------------------------------------------------------------------------------------------
     Description: routes used for customer's Status SubCode CRUD operation
     Author: Prasanna Shrestha
     Date : 16/10/2015
    ------------------------------------------------------------------------------------------------------*/
    app.get('/api/statusSubCode/:customerId/:statusId', auth.requiresApiLogin, users.getResolutionTypes); // get all resolution Types
    app.post('/api/statusSubCode/:customerId/:statusId', auth.requiresApiLogin, users.addResolutionType); // add new resolution Type
    app.put('/api/statusSubCode/:typeId', auth.requiresApiLogin, users.updateResolutionTypeName); // update resolution Type by type id
    app.delete('/api/statusSubCode/:statusId/:typeId', auth.requiresApiLogin, users.deleteResolutionType);  // delete resolution Type by type id  

    /**route to get totalnumber of  customer's user list @RuchiDhami**/
    app.post('/api/totalCustomerUsers/:customerId', auth.requiresApiLogin, users.getTotalCustomerUsers);
    app.get('/api/priorities', auth.requiresApiLogin, users.getSRPriorities); /** route to get user's SR priorities List**/
    app.put('/api/priorities/:priorityId', auth.requiresApiLogin, users.updateSRPriorities); /** route to get user's SR priorities List**/

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
    app.put('/api/saveSelectedChildStatus/:srStatusId',sr.saveSelectedChildStatus); /**save Status save Selected Child Status @Prasanna**/
    app.get('/api/getRelatedStatus/:srStatusId',sr.getRelatedStatus); /**save Status save Selected Child Status @Prasanna**/

    /*----------------------------------------------------------------------------------------------------
     Description: routes used for projects
     Author: SubinJoshi    
    ------------------------------------------------------------------------------------------------------*/
    app.post('/api/createProject/:customerId', auth.requiresApiLogin, projects.createProject); /** route to create new project by Customer **/
    app.get('/api/getProjectList/:customerId', auth.requiresApiLogin, projects.getProjectList); /** route to get project list under customer **/
    app.get('/api/getProjectDetail/:projectId', auth.requiresApiLogin, projects.getProjectDetail);
    /** route to get project Detail by projectId **/
    app.delete('/api/deleteProject/:projectId', projects.deleteProject); /** route to delete project by projectId  **/
    app.put('/api/updateProject/:projectId', projects.updateProject); /** route to update project by project ID **/
    app.get('/api/getProjectListNames/:customerId', auth.requiresApiLogin, projects.getProjectListNames);
    //app.get('/api/getProjectMembers/:projectId', projects.getProjectMembersName);
    app.put('/api/updateMemberRole/:projectId', projects.updateMemberRole); /** update member role by project ID **/
    app.get('/api/getUserPermissionInProject/:projectId', projects.getUserPermissionInProject);
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
    app.get('/api/getAllRoles/:customerId', roles.getAllRoles); /** route to get all roles **/
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

    app.post('/api/setAdmin', projects.setAdmin); //route to set a project member as admin


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
        res.render('../../../public/views/domainsub/' + req.params[0]);
    });

    app.get("/dashboard/*", ensureAuthenticated, function(req, res) {
        res.render("../../../public/views/domainsub/dashboard-new");
    });
    app.get('/dashboard', ensureAuthenticated, users.dashboard);
    app.get('/', function(req, res) {
        res.redirect('/dashboard');
    });

    app.post('/api/login', auth.authenticate);
    app.post('/logout', function(req, res) {
        req.logout();
        res.end();
    });  

    app.get('/login', function(req, res) {
        if (!req.isAuthenticated()) {
            res.render('../../../public/views/domainsub/login');
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
            //res.render('../../../../public/views/domainsub/login');
        } else {
            return next();
        }

    }
    /*app.use(function(err, req, res, next) {
      if(!err) return next()
      console.log(err.stack)
      res.status(500).send({status:"error", message: err.message})
    })*/
}
