var nodemailer = require('nodemailer');
const MY_EMAIL = process.env.MY_EMAIL
const MY_EMAIL_PASSWORD = process.env.MY_EMAIL_PASSWORD

async function sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: MY_EMAIL,
                pass: MY_EMAIL_PASSWORD,
            }
        });
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error is " + error);
                resolve(false); 
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        })

    })
}

module.exports = sendEmail;
