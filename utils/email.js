const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create Transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
    // Remember to active the "less secure app" option for Gmail to work with nodemailer
  });
  // 2) Define Options
  const mailOptions = {
    from: 'Thomas Collins <thomascollins582@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
