// routes/posts.ts
import express from "express";
import { db } from "../database";

const router = express.Router();

// Get all posts (for Dashboard)
router.get("/", async (req: express.Request, res: express.Response) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT p.*, u.mode as user_mode, u.username as actual_username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        // Modify posts to hide username in undercover mode
        const modifiedPosts = posts.map((post) => {
            console.log(`Post ID ${post.id}: user_mode=${post.user_mode}, actual_username=${post.actual_username}`); // Debug
            if (post.user_mode === "undercover") {
                return { ...post, username: "Anonymous" };
            }
            return post;
        });

        console.log(`[${new Date().toISOString()}] /api/posts returned ${modifiedPosts.length} posts`);
        res.json(modifiedPosts);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Get posts error:`, err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get news feed posts (mode: "main")
router.get("/newsfeed", async (req: express.Request, res: express.Response) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT p.*, u.mode as user_mode, u.username as actual_username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.mode = 'main' ORDER BY p.created_at DESC",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        // Modify posts to hide username in undercover mode
        const modifiedPosts = posts.map((post) => {
            console.log(`News Feed Post ID ${post.id}: user_mode=${post.user_mode}, actual_username=${post.actual_username}`); // Debug
            if (post.user_mode === "undercover") {
                return { ...post, username: "Anonymous" };
            }
            return post;
        });

        console.log(`[${new Date().toISOString()}] /api/posts/newsfeed returned ${modifiedPosts.length} posts`);
        res.json(modifiedPosts);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Get news feed error:`, err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
