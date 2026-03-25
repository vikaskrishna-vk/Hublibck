const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");


// ================= JWT TOKEN =================
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};


// ================= VALIDATIONS =================
const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
};

const isGmail = (email) => {
  return email.endsWith("@gmail.com");
};



// ================= REGISTER (SEND OTP) =================
router.post("/register", async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    // gmail validation
    if (!isGmail(email)) {
      return res.status(400).json({
        message: "Only Gmail accounts are allowed",
      });
    }

    // password validation
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain 8+ characters, uppercase, lowercase, number and special character",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // SEND OTP EMAIL
//     await sendEmail(
//       email,
//       "OTP Verification",
//       `
//       <h2>Hello ${name}</h2>
//       <p>Your OTP for account verification is:</p>
//       <h1>${otp}</h1>
//       <p>This OTP will expire in 10 minutes.</p>
//       `
//     );

//     res.json({
//       message: "OTP sent to email",
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



// ================= VERIFY OTP =================
// router.post("/verify-otp", async (req, res) => {
//   try {

//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not found",
//       });
//     }

//     if (user.otp !== otp || user.otpExpire < Date.now()) {
//       return res.status(400).json({
//         message: "Invalid or expired OTP",
//       });
//     }

//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpire = null;

//     await user.save();

    // SEND SUCCESS EMAIL
    await sendEmail(
      email,
      "Registration Successful 🎉",
      `
      <h2>Welcome ${user.name}</h2>
      <p>Your account has been successfully verified.</p>
      <p>You can now login and start using the platform.</p>
      <br>
      <b>Your Role: ${user.role}</b>
      `
    );

    res.json({
      message: "Account verified successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }


    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h3>Your OTP: ${otp}</h3><p>Valid for 10 minutes</p>`
    );

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    if (!isStrongPassword(newPassword))
      return res.status(400).json({
        message: "Password must contain 8+ characters, uppercase, lowercase, number and special character",
      });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    await sendEmail(
      user.email,
      "🔐 Password Reset Successful - HMS",
      `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hello ${user.name},</h2>
        <p>Your password has been successfully changed.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <br/>
        <b>Stay secure,</b><br/>
        HMS Security Team
      </div>
      `
    );

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;


module.exports = router;