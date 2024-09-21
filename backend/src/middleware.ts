import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string, (err, user) => {
        if (err) {
            console.log('Invalid token');
            return res.sendStatus(403);
        }
        req.user = user;
        console.log('User authorized');
        next();
    });
}