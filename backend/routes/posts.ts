import express from 'express';
import jwt from 'jsonwebtoken'; // Add this import
import { db } from '../database';

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || "teenverse_secret") as { email: string, verified: number };
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Get all posts (for Dashboard and News Feed)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT id, user_id, username, content, likes, created_at, mode FROM posts ORDER BY created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
        res.json(posts);
    } catch (err) {
        console.error("Get posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get posts for News Feed (mode = 'main')
router.get('/newsfeed', authenticateToken, async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT id, user_id, username, content, likes, created_at, mode FROM posts WHERE mode = 'main' ORDER BY created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
        res.json(posts);
    } catch (err) {
        console.error("Get newsfeed posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get posts for Rant Zone (mode = 'rant')
router.get('/rant-zone', authenticateToken, async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT id, user_id, username, content, likes, created_at, mode FROM posts WHERE mode = 'rant' ORDER BY created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
        res.json(posts);
    } catch (err) {
        console.error("Get rant zone posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: { email: string, verified: number };
        }
    }
            }
