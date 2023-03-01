import * as nodemailer from 'nodemailer';

// Credentials from ENV
const MY_EMAIL = process.env.MY_EMAIL;
const MY_EMAIL_PASSWORD = process.env.MY_EMAIL_PASSWORD;

// Async Function for Sending Emails
export async function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: MY_EMAIL,
        pass: MY_EMAIL_PASSWORD,
      },
    });
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('error is ' + error);
        resolve({ isError: true, error });
      } else {
        console.log('Email sent: ' + info.response);
        resolve({ isError: false });
      }
    });
  });
}
