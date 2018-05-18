const nodemailer = require('nodemailer');
const config = require('../../config');

const smtpConfig = Object.assign({}, config.mailer.smtp, { connectionTimeout: 1000 });
const transporter = nodemailer.createTransport(smtpConfig);

module.exports = transporter;
