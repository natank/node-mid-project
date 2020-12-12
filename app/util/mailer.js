const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

module.exports = {
  transporter
}