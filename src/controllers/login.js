import { validEmail ,sendOTP } from "../services/otpService.js";
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import crypto from 'crypto';

const otpStore = new Map();  // In-memory store for OTPs

export const loginController = (req,res) => { 
    const { email } = req.body;
    if(validEmail(email)){
        const OTP = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
        otpStore.set(email,{ OTP, expiresAt });
        sendOTP(email,OTP);
        return { success: true, message: "OTP sent to email" };
    } 
}

export const generateToken = (id,email) => {
    return jwt.sign({id,email},process.env.JWT_SECTET,{ expiresIn: process.env.JWT_EXPIRES_IN });
}

export const validateOTP = async (req,res) => {
    const { email, otp } = req.query; 
    if(otpStore.has(email)){
        const { OTP, expiresAt } = otpStore.get(email);
        if(Date.now() > expiresAt){
            otpStore.delete(email);
            res.status(400).json({ message: "OTP expired" });
            return;
        }
        if(OTP === otp){
            otpStore.delete(email);
            const user = await prisma.user.findUnique({ where: { email } });
            const jwttoken = generateToken(user.id, user.email);
            res.cookie('jwttoken', jwttoken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 3 * 60 * 60 * 1000 });
            res.status(200).json({ message: "Login successful"});
            return;
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    }
}

export const getKeys = async (req,res) => {
    const {userId, email} = req.user;
    try{
        const keys = await prisma.apiKey.findMany({ where: { userId } });
        res.status(200).json({ keys });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const addKey = async (req,res) => {
    const { userId, email } = req.user;
    const newKey =  crypto.randomBytes(32).toString('hex'); // Generate a random 64-character hexadecimal key
    if(!newKey){
        res.status(500).json({ message: "Failed to generate key" });
        return;
    }
    try{
        const createdKey = await prisma.apiKey.create({ data: { userId, keyHash: newKey } });
        res.status(201).json({ key: createdKey.keyHash });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteKey = async (req,res) => {
    const { userId } = req.user;
    const { key } = req.body;
    try{
        const deleteKeyRecord = await prisma.apiKey.deleteMany({ where: { userId, keyHash: key } });
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
