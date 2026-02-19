const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {

    const transporter = nodemailer.createTransport({

      host: "smtp.gmail.com",
      port: 587,
      secure: false, // IMPORTANT: false for port 587
       
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }

    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("EMAIL SENT:", info.response);

  } catch (error) {

    console.log("EMAIL ERROR:", error);

  }
};

module.exports = sendEmail;
