import jwt from 'jsonwebtoken';

export const requireAuth = (req,res,next)=>{
    const token = req.cookies?.jwttoken;
    if(!token){
        return res.status(401).json({ message: "Unauthorized: Please log in." });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({ message: "Forbidden: Session expired." });
    }
}