const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create Transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    // auth: {
    //   user: process.env.GMAIL_USERNAME,
    //   pass: process.env.GMAIL_PASSWORD,
    // },
    // Remember to active the "less secure app" option for Gmail to work with nodemailer
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD,
    },
  });
  // 2) Define Options
  const mailOptions = {
    from: `Thomas Collins <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
