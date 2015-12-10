// var nodemailer = require('nodemailer');

// /** create reusable transporter object using SMTP transport  **/
// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'subin.joshi@javra.com',
//         pass: 'Subinjoshi1234'
//     }
// });


// // NB! No need to recreate the transporter object. You can use
// // the same transporter object for all e-mails

// // setup e-mail data with unicode symbols

// function mailSendOnSignUp(useremail, html, subject){	
// 	console.log(useremail);
// 	console.log('inside mail send on sign up');
// 	var mailOptions = {
// 					  from: 'SaaS Xepst <xepst@javra.com>' , // sender address
// 					  to:  'subin.joshi@javra.com', // list of receivers                        
// 					  subject: subject, // Subject line
// 					  html: html
// 					  };
    

//    // send mail with defined transport object

// 	// send mail with defined transport object
// 		transporter.sendMail(mailOptions, function(error, info){
// 		    if(error){
// 		        return console.log(error);
// 		    }
// 		    console.log('Message sent: ' + info.response);

// 		});
    

// }


// exports.mailSendOnSignUp = mailSendOnSignUp;