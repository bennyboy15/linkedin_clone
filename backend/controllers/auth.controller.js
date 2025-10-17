import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function signup(req,res){
    try {
        const {name, username, email, password} = req.body;

        // MISSING FIELDS
        if (!name || !username || !email || !password) {
            return res.status(400).json({success:false, message: "All fields are required"});
        };

        // EMAIL ALREADY EXISTS?
        const existingEmail = await User.findOne({email});
        if (existingEmail){
            return res.status(400).json({success:false, message: "Email already exists"});
        };

        // USERNAME ALREADY EXISTS?
        const existingUsername = await User.findOne({username});
        if (existingUsername){
            return res.status(400).json({success:false, message: "Username already exists"});
        };

        // PASSWORD LENGTH
        if (password.length < 6) {
            return res.status(400).json({success:false, message: "Password must be at least 6 characters"});
        };

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        // SAVE USER
        const user = new User({name, username, email, password:hashed_password});
        await user.save();

        // GENERATE TOKEN
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
            expiresIn: "3d"
        });

        // SET COOKIE
        res.cookie("jwt-linkedin", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({success:true, message: "User registered successfully"});

        // SEND WELCOME EMAIL
        const profileUrl = `${process.env.CLIENT_URL}/profile/${user.username}`;
        
        try {
            await sendWelcomeEmail(user.email, user.name, profileUrl);
        } catch (error) {
            console.log("Error sending welcome email:", error);
        }

    } catch (error) {
        console.log("Error in signup:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function login(req,res){
    try {
        const {username, password} = req.body;
        
        // MISSING FIELDS 
        if(!username || !password) {
            return res.status(400).json({success:false, message:"All fields are required"});
        };

        // USER EXISTS?
        const existingUser = await User.findOne({username});
        if(!existingUser) {
            return res.status(400).json({success:false, message:"Invalid credentials"});
        };

        // PASSWORD CORRECT?
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({success:false, message:"Invalid credentials"});
        };

        // GENERATE TOKEN
        const token = jwt.sign({userId: existingUser._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
        await res.cookie("jwt-linkedin", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.json({message: "Logged in successfully"});

    } catch (error) {
        console.log("Error in login:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export function logout(req,res){
    res.clearCookie("jwt-linkedin");
    res.json({success: true, message: "Logged out successfully"});
};

export async function getCurrentUser(req,res) {
    try {
        res.json(req.user)
    } catch (error) {
        console.log("Error in getCurrentUser controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};