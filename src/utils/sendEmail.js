const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Smart-Agri" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent:", info.response);

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = sendEmail;