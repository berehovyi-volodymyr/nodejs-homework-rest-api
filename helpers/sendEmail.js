const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: "dojofek509@saeoil.com",
  from: "berehovyi.volodymyr@gmail.com",
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

const sendEmail = async (data) => {
  await sgMail
    .send(data)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
  return true;
};

module.exports = sendEmail;
