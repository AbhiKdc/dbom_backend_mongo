import nodemailer from 'nodemailer';
import getConfigs from '../../config/config.js';

const Configs = getConfigs();

export const SendOtpEmail = (email_id, content, subject) => {
  const transporter = nodemailer.createTransport({
    host: Configs.mail.host,
    port: 587,
    auth: {
      user: Configs.mail.userMail,
      pass: Configs.mail.userPass,
    },
  });

  var mailOptions = {
    from: Configs.mail.userMail,
    to: email_id,
    subject: subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return error;
    } else {
      console.log('Email sent successfully.');
      return info;
    }
  });
};
