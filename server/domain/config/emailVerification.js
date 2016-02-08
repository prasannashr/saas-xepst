/*----------------------------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
------------------------------------------------------------------------------------------------------
  File        : main/server/config/emailVerification.js
  Description : creates and sends verification email for newly registered customers
  Input param : user details, i.e fullname, subdomain, email, passed in as an object, named newUser
  Output param: returns a message whether an email was sent or any issue was encountered
  Author      : Rikesh Bhansari
  Created     : 11/09/2015

Date   		Author Version 	Description
---------------------------------------------------------------------------------------------
10/09/2015 Rikesh	 v1 	creates and sends verification email for newly registered customers
---------------------------------------------------------------------------------------------*/

var _ = require('underscore'),
	fs = require('fs'),
	jwt = require('jwt-simple'),
	nodemailer = require('nodemailer'),
	env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
	config = require('../../config/config.js')[env],
	User = require('../../domainsub/models/User.js'),
	trycatch = require('trycatch');

var model = {}

//details of email sender
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.sender_add,
        pass: config.sender_pass
    }
});

/*----------------------------------------------------------------------------------------------------
 Name 		: send
 Description: sends email to newly signed customer for verification
 Author		: Rikesh Bhansari
------------------------------------------------------------------------------------------------------*/
exports.send = function(newUser) {
	trycatch(function() {
		var payload = {
			sub: newUser.email,
			date: new Date(),
			customerId: newUser.customerId,
			password: newUser.password
		}
		
		//token, created for verifying the email, which is sent along with the verification email
		var token = jwt.encode(payload, config.email_secret);
		
		//details displayed to the receiver
		var mailOptions = {
			from: 'SaaS XEPST <softwarejavra@gmail.com>',
			to: newUser.email,
			subject: 'SaaS XEPST Account Verification',
			html: getHtml(token, newUser)
		};
		//sends email
		transporter.sendMail(mailOptions, function(err, info) {
			if(err) return handleError(res, err);
			console.log('Email Sent ', info.response);
		})
	}, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name 		: handler
 Description: handles customer email verification upon clicking the verify button by customer 
 			  in the email sent for verification.
 Author		: Rikesh Bhansari
------------------------------------------------------------------------------------------------------*/
exports.handler = function(req, res, next) {
	trycatch(function() {
		var token = req.query.token;	
		var payload = jwt.decode(token, config.email_secret);
		var email = payload.sub;
		var customerId = payload.customerId;
		var password = payload.password;

		if(!email) return handleError(res);

		User.findOne({'customerId': customerId, 'app_users.email': email}, function(err,foundUser) {
			if(err) return handleError(res,err);

			if(!foundUser) return handleError(res);
			
			if(!foundUser.app_users[0].status) {
				foundUser.app_users[0].status = true;
			}
			
			foundUser.save(function(err) {
				if(err) return res.status(500);
				req.body.username = payload.sub;
				req.body.email = payload.sub;
				req.body.password = payload.password;
				req.body.subdomain = foundUser.subdomain;	

				 passport.authenticate('local', function(err, user) {
				 	
				    if (err) { return next(err); }
				    if (!user) { return res.redirect('/'); }
				    if(user[0]) {
			            delete user[0].app_users.hashed_pwd;
			            //console.log("------passport.authenticate: ---",user);
			        } 
				    req.logIn(user, function(err) {
				      if (err) { return next(err); }
				      //console.log("------req.logIn: --- ",req.user);
				      var app_url = config.app_url.split('.');
						if (app_url[0] == 'www') {
						    app_url[0] = foundUser.subdomain;
						    app_url = app_url.join('.');
						} else {
						    app_url = app_url.join('.');
						    app_url = foundUser.subdomain + '.' + app_url+'/dashboard';
						}
						return res.redirect('http://'+app_url);
				      
				    });
				})(req, res, next);				
				
			})
		})
	}, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name 		: getHtml
 Description: prepares the email to be sent to the customer for verification
 Author		: Rikesh Bhansari
------------------------------------------------------------------------------------------------------*/
function getHtml(token, newUser) {
	var path = config.rootPath + 'public/views/domainsub/emailVerification.html';
	var html = fs.readFileSync(path, encoding = 'utf8');
	var template = _.template(html);	
	trycatch(function() {		
		model.verifyUrl= 'http://'+newUser.subdomain+'.'+config.app_url+'/auth/verifycustomer?token=';
		model.verifyUrl += token;
		model.user = newUser.fullname;
		var app_url = config.app_url.split('.');
		if(app_url[0]=='www') {
			// replace www with subdomain
			app_url[0] = newUser.subdomain;
			// merge the url with subdomain
			app_url = app_url.join('.');
			model.subdomain = app_url;
		} else {
			model.subdomain = newUser.subdomain +'.'+ config.app_url;
		}
		model.password = newUser.password;	
		//console.log(model);	

	}, function(err) {
        console.log(err.stack);
        console.log(err.message);
        //return handleError(res, err);
    })
    return template(model);
}

/*----------------------------------------------------------------------------------------------------
 Name 		: sendEmailToNewUser
 Description: sends email to newly added user
 Author		: Rikesh Bhansari
 Created 	: 2015/09/17
------------------------------------------------------------------------------------------------------*/
exports.sendEmailToNewUser = function(newuser) {
	
	//details displayed to the receiver
	var mailOptions = {
		from: 'SaaS XEPST <softwarejavra@gmail.com>',
		to: newuser.email,
		subject: 'SaaS XEPST Account Created',
		html: getUserEmailHtml(newuser)
	};

	//sends email
	transporter.sendMail(mailOptions, function(err, info) {
		if(err) return console.log(err);
		console.log('Email Sent To User', newuser.email, info.response);
	});

}

/*----------------------------------------------------------------------------------------------------
 Name 		: getUserEmailHtml
 Description: prepares the email to be sent to the customer for verification
 Author		: Rikesh Bhansari
------------------------------------------------------------------------------------------------------*/
function getUserEmailHtml(newuser) {
	var path = config.rootPath + 'public/views/domainsub/emailUserAdded.html';
	var html = fs.readFileSync(path, encoding = 'utf8');
	var template = _.template(html);
	trycatch(function() {		

		model.user = newuser.fullname;
		var app_url = config.app_url.split('.');
		model.subdomain = newuser.subdomain;
		model.password = newuser.password;
		
	}, function(err) {
        console.log(err.stack);
        console.log(err.message);        
    })
    return template(model);
}

/*----------------------------------------------------------------------------------------------------
 Name 		: _.templateSettings
 Description: INTERPOLATE regex definition needed for placing variable information in verification email.
 Author		: Rikesh Bhansari
------------------------------------------------------------------------------------------------------*/
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

function handleError(res, err) {
    return res.send(500, err);
}