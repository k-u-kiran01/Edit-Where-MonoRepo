import prisma from "../db.js";

export const requireCliAuth = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized:Missinf API Key" });
    }
    const apiKey = authHeader.split(' ')[1];
    try{
        const keyRecord = await prisma.apiKey.findUnique({ where: { keyHash: apiKey } });
        if(!keyRecord){
            return res.status(401).json({ message: "Forbidden: Invalid API Key" });
        }
        req.user = { userId: keyRecord.userId };
        next();
    }catch(error){
       console.error("Auth Middleware Error:", error); // ADD THIS LINE!
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
