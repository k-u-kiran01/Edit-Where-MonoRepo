import { validEmail ,sendOTP } from "../services/loginServices.js";
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import crypto from 'crypto';
import { log } from "console";

const otpStore = new Map();  // In-memory store for OTPs

export const checkAuthController = (req,res) =>{

    res.status(200).json({
        isAuthenticated: true,
        user: {
            id: req.user.id,
            email: req.user.email
        }
    })
}

export const loginController = (req,res) => { 
    const { email } = req.body;
    if(validEmail(email)){
        const OTP = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
        otpStore.set(email,{ OTP, expiresAt });
        try{
            sendOTP(email,OTP);
            res.status(200).json({ success: true, message: "OTP sent to email" })
        }catch(err){
            res.status(500).json({ message:"Failed to dispatch email. Please try again." })
        }
    } 
}

export const generateToken = (id,email) => {
    return jwt.sign({id,email},process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN });
}

export const validateOTP = async (req,res) => {
    const { email, otp } = req.body; 
    if(!otpStore.has(email)){
        return res.status(400).json({ message: "No OTP request found for this email" })
    }
    const { OTP, expiresAt } = otpStore.get(email);
    if(Date.now() > expiresAt){
        otpStore.delete(email);
        res.status(400).json({ message: "OTP expired" });
        return;
    }
    if(OTP !== otp){
        return res.status(400).json({ message: "Invalid OTP" });
    }
    otpStore.delete(email);
    try{
        const user = await prisma.user.upsert({ 
            where: { email }, 
            update: {},
            create: {
                email: email
            }
        });
        const jwttoken = generateToken(user.id, user.email);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('jwttoken', jwttoken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction? 'Strict' : 'Lax',
            maxAge: 3*60*60*1000
        })
        return res.status(200).json({ message: "Login successful", user: { id:user.id, email: user.email }});
    }catch(error){
        console.error("Database error during login:", error);
        return res.status(500).json({ message:"Internal server error" });
    };
}

export const logoutController = (req,res) =>{
    res.clearCookie('jwttoken', { httpOnly: true, secure: true, sameSite: 'strict' });
    res.status(200).json({ message: "Logout successful" });
}

export const getKeys = async (req,res) => {
    const {id} = req.user;
    try{
        const keys = await prisma.apiKey.findMany({ where: { userId: id }, orderBy: {createdAt: 'desc'} });
        const formattedKeys = keys.map(k =>({
            id:k.id,
            name:k.name,
            keyString: k.keyHash,
            workspaceId: 'ALL',
            createdAt: k.createdAt
        }))

        res.status(200).json(formattedKeys);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const addKey = async (req,res) => {
    
    const { id } = req.user;
    const { name } = req.body;
    const newKey =  crypto.randomBytes(32).toString('hex'); // Generate a random 64-character hexadecimal key
    if(!newKey){
        res.status(500).json({ message: "Failed to generate key" });
        return;
    }
    try{
        const createdKey = await prisma.apiKey.create({ data: { userId: id, name: name || "Untitled Key", keyHash: newKey } });

        res.status(201).json({ 
            id:createdKey.id,
            name: createdKey.name,
            keyString: createdKey.keyHash,
            workspaceId: 'ALL',
            createdAt: createdKey.createdAt
         });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteKey = async (req,res) => {
    const { id: currentUserId } = req.user;
    let { id: keyToDeleteId } = req.params;
    keyToDeleteId = parseInt(keyToDeleteId);
    try{
        const deleteKeyRecord = await prisma.apiKey.deleteMany({ where: { id: keyToDeleteId, userId: currentUserId } });
        if(deleteKeyRecord.count === 0){
            res.status(404).json({ message: "Key not found" });
            return;
        }
        res.status(200).json({ message: "Key deleted successfully" });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
 