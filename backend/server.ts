import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "./database";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = "teenverse_secret"; // Change this in production

// Register Route
app.post("/register", async (req, res) => {
    const { email, password, dob } = req.body;
    const birthYear = parseInt(dob.split("-")[0]);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (age < 13 || age > 19) {
        return res.status(400).json({ message: "Get Out, Oldie. This Ain’t for You" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (email, password, dob, verified) VALUES (?, ?, ?, ?)", 
        [email, hashedPassword, dob, 0], 
        (err) => {
            if (err) return res.status(500).json({ message: "User already exists" });
            res.json({ message: "Registered successfully!" });
        }
    );
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email, verified: user.verified }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, message: "Login successful" });
    });
});

// Toggle User Mode (Main <-> Undercover)
app.post("/toggle-mode", (req, res) => {
    const { email } = req.body;

    db.get("SELECT mode FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ message: "User not found" });

        const newMode = user.mode === "main" ? "undercover" : "main";

        db.run("UPDATE users SET mode = ? WHERE email = ?", [newMode, email], (err) => {
            if (err) return res.status(500).json({ message: "Error updating mode" });
            res.json({ message: `Switched to ${newMode}` });
        });
    });
});

app.post("/create-post", (req, res) => {
    const { email, content } = req.body;

    db.get("SELECT id, mode FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ message: "User not found" });

        db.run("INSERT INTO posts (user_id, content, mode) VALUES (?, ?, ?)", 
            [user.id, content, user.mode], 
            (err) => {
                if (err) return res.status(500).json({ message: "Error creating post" });
                res.json({ message: "Post created successfully!" });
            }
        );
    });
});
const newXP = user.xp + 5;
            db.run("UPDATE users SET xp = ? WHERE id = ?", [newXP, user.id]);

            res.json({ message: "Post created! +5 XP", newXP });
        });
    });
});

// Update user's coin balance
                const newCoins = user.coins + 5;
                db.run("UPDATE users SET coins = ? WHERE id = ?", [newCoins, user.id]);

                res.json({ message: "Post created! +5 coins", newCoins });
            }
        );
    });
});

app.post("/get-coins", (req, res) => {
    const { email } = req.body;

    db.get("SELECT coins FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ coins: user.coins });
    });
});

app.post("/buy-coins", (req, res) => {
    res.json({ message: "Buying coins is not available yet." });
});

app.post("/daily-login", (req, res) => {
    const { email } = req.body;
    const today = new Date().toISOString().split("T")[0];

    db.get("SELECT xp, last_login FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.last_login !== today) {
            const newXP = user.xp + 10;
            db.run("UPDATE users SET xp = ?, last_login = ? WHERE email = ?", [newXP, today, email]);
            return res.json({ message: "+10 XP for daily login!", newXP });
        }

        res.json({ message: "Already claimed XP today!" });
    });
    
});
function calculateLevel(xp: number): { level: number; rank: string } {
    let level = Math.floor(xp / 10) + 1;
    if (level > 100) level = 100;

    let rank = "Newbie";
    if (level >= 11) rank = "Rising Star";
    if (level >= 26) rank = "Clout Lord";
    if (level >= 51) rank = "Elite";
    if (level >= 76) rank = "Titan";
    if (level >= 100) rank = "Shadow Rank";

    return { level, rank };
}

app.post("/get-user-stats", (req, res) => {
    const { email } = req.body;

    db.get("SELECT xp FROM users WHERE email = ?", [email], (err, user) => {
        if (!user) return res.status(404).json({ message: "User not found" });

        const { level, rank } = calculateLevel(user.xp);
        res.json({ xp: user.xp, level, rank });
    });
});

function checkSnitchStatus() {
    db.all("SELECT id, xp FROM users", [], (err, users) => {
        users.forEach((user) => {
            db.get("SELECT SUM(xp) as weekly_xp FROM posts WHERE user_id = ? AND created_at >= datetime('now', '-7 days')", 
            [user.id], (err, data) => {
                const weeklyXP = data?.weekly_xp || 0;
                const snitchStatus = weeklyXP < 50 ? "Potential Snitch" : "clean";

                db.run("UPDATE users SET snitch_status = ? WHERE id = ?", [snitchStatus, user.id]);
            });
        });
    });
}

// Run snitch check every 24 hours
setInterval(checkSnitchStatus, 86400000);

const dbPromise = open({ filename: "database.sqlite", driver: sqlite3.Database });

app.post("/post", async (req, res) => {
    const { userId, content, mode } = req.body;
    const db = await dbPromise;
    await db.run("INSERT INTO posts (user_id, content, mode) VALUES (?, ?, ?)", [userId, content, mode]);
    res.json({ message: "Post created" });
});

app.post("/like", async (req, res) => {
    const { userId, postId } = req.body;
    const db = await dbPromise;
    try {
        await db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId]);
        await db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);

        // Check if post reached 50 likes
        const post = await db.get("SELECT likes, mode FROM posts WHERE id = ?", [postId]);
        if (post.likes >= 50 && post.mode === "undercover") {
            await db.run("UPDATE posts SET created_at = NULL WHERE id = ?", [postId]); // Prevent expiration
        }

        // Check if user qualifies for "News King" badge
        const totalLikes = await db.get("SELECT SUM(likes) as total FROM posts WHERE user_id = ?", [userId]);
        if (totalLikes.total >= 100) {
            await db.run("INSERT INTO badges (user_id, news_king) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET news_king = 1", [userId]);
        }

        res.json({ message: "Post liked" });
    } catch {
        res.status(400).json({ error: "Already liked" });
    }
});

app.get("/posts", async (req, res) => {
    const db = await dbPromise;
    const posts = await db.all("SELECT * FROM posts WHERE mode != 'rant' ORDER BY created_at DESC");
    res.json(posts);
});

app.get("/game-squad", async (req, res) => {
    const db = await dbPromise;
    const posts = await db.all("SELECT * FROM posts WHERE mode = 'game' ORDER BY created_at DESC");
    res.json(posts);
});

app.get("/rant-zone", async (req, res) => {
    const db = await dbPromise;
    const posts = await db.all("SELECT id, content, likes FROM posts WHERE mode = 'rant' ORDER BY created_at DESC");
    res.json(posts);
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
