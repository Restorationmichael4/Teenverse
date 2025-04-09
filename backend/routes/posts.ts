import express from "express";
import { db } from "../database";

const router = express.Router();

// Get all posts (for Dashboard, exclude rants)
router.get("/", async (req: express.Request, res: express.Response) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT p.*, u.username as actual_username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.mode != 'rant' ORDER BY p.created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get news feed posts (mode: "main", exclude rants)
router.get("/newsfeed", async (req: express.Request, res: express.Response) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT p.*, u.username as actual_username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.mode = 'main' AND p.mode != 'rant' ORDER BY p.created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
