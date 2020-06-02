// ./node/mail.js
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: false,
  auth: {
    user: 'tianwuphysics@gmail.com',
    pass: 'tianwuno1!'
  }
});

function sendMail(to, subject, text){
    transporter.sendMail({
        from: 'tianwuphysics@gmail.com',
        to, subject, text
    }, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}

exports.sendMail = sendMail;
