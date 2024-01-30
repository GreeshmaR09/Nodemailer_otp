const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../Model/User')
const jwt = require('jsonwebtoken')
const Nodemailer = require('nodemailer')
require('dotenv').config();



//userRegistration

router.post('/register', async (req, res) => {
    try {
        const { username, password,email } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            username: username,
            password: hashedPassword,
            email:email
        })
        await user.save()
        res.status(200).json({ message: "Registered" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "failed" })
    }
})

//userLogin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ error: 'invalid credentials' })
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({ error: 'invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: '1h' })
        res.status(200).json({ token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'login failed' })
    }
})

//forgotpassword

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}const transporter = Nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

router.post('/forgotpassword', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const otp = generateOTP();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 600000; // Token expires in 10 minutes
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email for password reset' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});


module.exports = router

