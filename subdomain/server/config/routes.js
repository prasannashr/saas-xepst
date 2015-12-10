var auth = require('./auth'),
  users = require('../controllers/users'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

module.exports = function(app) {

  //app.get('/api/users', auth.requiresRole('admin'), users.getUsers);
  app.get('/api/users',  users.getUsers);
  app.get('/api/customerUsers',  users.getCustomerUsers);
  app.post('/api/users', users.createUser);
  app.put('/api/users', users.updateUser);
  app.post('/api/users/addUser/:subdomainId', users.addUser);

  app.get('/api/login', function(req, res) {
    
    console.log(req.user);
    res.send( req.user);
  });

  app.get('/partials/*', function(req, res) {
    res.render('../../public/app/' + req.params[0]);
  });

  app.post('/api/login', auth.authenticate, users.dashboard);


  app.post('/logout', function(req, res) {
    req.logout();
    res.end();
  });

  app.get('/', ensureAuthenticated, users.dashboard);
  app.get('/login',users.loginPage);

  app.all('/api/*', function(req, res) {
    res.send(404);
  });

  function ensureAuthenticated(req, res, next) {
   
      if(!req.isAuthenticated()){
         res.redirect('/login');
      }else{
        return next();
      }
   
  }


  
}