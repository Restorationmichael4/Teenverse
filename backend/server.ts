import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path"; // Import path module
import postRoutes from './routes/posts';

// Initialize dotenv
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "teenverse_secret"; // Change this in production

const dbPromise = open({ filename: "database.sqlite", driver: sqlite3.Database });

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'dist/frontend')));

// Catch all route to serve index.html for any route not handled by the API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend', 'index.html'));
});

// Register Route
app.post("/register", async (req, res) => {
    try {
        const { email, password, dob } = req.body;
        const birthYear = parseInt(dob.split("-")[0]);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        if (age < 13 || age > 19) {
            return res.status(400).json({ message: "Get Out, Oldie. This Ain’t for You" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const db = await dbPromise;
        await db.run("INSERT INTO users (email, password, dob, verified) VALUES (?, ?, ?, ?)", [email, hashedPassword, dob, 0]);
        res.json({ message: "Registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "User already exists" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await dbPromise;
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email, verified: user.verified }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Toggle User Mode (Main <-> Undercover)
app.post("/toggle-mode", async (req, res) => {
    try {
        const { email } = req.body;
        const db = await dbPromise;
        const user = await db.get("SELECT mode FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newMode = user.mode === "main" ? "undercover" : "main";
        await db.run("UPDATE users SET mode = ? WHERE email = ?", [newMode, email]);
        res.json({ message: `Switched to ${newMode}` });
    } catch (err) {
        res.status(500).json({ message: "Error updating mode" });
    }
});

// Create Post Route
app.post("/create-post", async (req, res) => {
    try {
        const { email, content } = req.body;
        const db = await dbPromise;
        const user = await db.get("SELECT id, mode, xp, coins FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ message: "User not found" });

        await db.run("INSERT INTO posts (user_id, content, mode) VALUES (?, ?, ?)", [user.id, content, user.mode]);

        const newXP = user.xp + 5;
        await db.run("UPDATE users SET xp = ? WHERE id = ?", [newXP, user.id]);

        const newCoins = user.coins + 5;
        await db.run("UPDATE users SET coins = ? WHERE id = ?", [newCoins, user.id]);

        res.json({ message: "Post created! +5 XP and +5 coins", newXP, newCoins });
    } catch (err) {
        res.status(500).json({ message: "Error creating post" });
    }
});

// Get Coins Route
app.post("/get-coins", async (req, res) => {
    try {
        const { email } = req.body;
        const db = await dbPromise;
        const user = await db.get("SELECT coins FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ coins: user.coins });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Buy Coins Route
app.post("/buy-coins", (req, res) => {
    res.json({ message: "Buying coins is not available yet." });
});

// Daily Login Route
app.post("/daily-login", async (req, res) => {
    try {
        const { email } = req.body;
        const today = new Date().toISOString().split("T")[0];
        const db = await dbPromise;
        const user = await db.get("SELECT xp, last_login FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.last_login !== today) {
            const newXP = user.xp + 10;
            await db.run("UPDATE users SET xp = ?, last_login = ? WHERE email = ?", [newXP, today, email]);
            return res.json({ message: "+10 XP for daily login!", newXP });
        }

        res.json({ message: "Already claimed XP today!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get User Stats Route
app.post("/get-user-stats", async (req, res) => {
    try {
        const { email } = req.body;
        const db = await dbPromise;
        const user = await db.get("SELECT xp FROM users WHERE email = ?", [email]);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { level, rank } = calculateLevel(user.xp);
        res.json({ xp: user.xp, level, rank });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
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

function checkSnitchStatus() {
    dbPromise.then(db => {
        db.all("SELECT id, xp FROM users", [], (err, users) => {
            if (err) throw err;
            users.forEach((user) => {
                db.get("SELECT SUM(xp) as weekly_xp FROM posts WHERE user_id = ? AND created_at >= datetime('now', '-7 days')", 
                [user.id], (err, data) => {
                    if (err) throw err;
                    const weeklyXP = data?.weekly_xp || 0;
                    const snitchStatus = weeklyXP < 50 ? "Potential Snitch" : "clean";

                    db.run("UPDATE users SET snitch_status = ? WHERE id = ?", [snitchStatus, user.id]);
                });
            });
        });
    }).catch(err => console.error(err));
}

// Run snitch check every 24 hours
setInterval(checkSnitchStatus, 86400000);

// Post Route
app.post("/post", async (req, res) => {
    try {
        const { userId, content, mode } = req.body;
        const db = await dbPromise;
        await db.run("INSERT INTO posts (user_id, content, mode) VALUES (?, ?, ?)", [userId, content, mode]);
        res.json({ message: "Post created" });
    } catch (err) {
        res.status(500).json({ message: "Error creating post" });
    }
});

// Like Route
app.post("/like", async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const db = await dbPromise;
        await db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId]);
        await db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);

        const post = await db.get("SELECT likes, mode FROM posts WHERE id = ?", [postId]);
        if (post.likes >= 50 && post.mode === "undercover") {
            await db.run("UPDATE posts SET created_at = NULL WHERE id = ?", [postId]); // Prevent expiration
        }

        const totalLikes = await db.get("SELECT SUM(likes) as total FROM posts WHERE user_id = ?", [userId]);
        if (totalLikes.total >= 100) {
            await db.run("INSERT INTO badges (user_id, news_king) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET news_king = 1", [userId]);
        }

        res.json({ message: "Post liked" });
    } catch (err) {
        res.status(400).json({ error: "Already liked" });
    }
});

// Get Posts Route
app.get("/posts", async (req, res) => {
    try {
        const db = await dbPromise;
        const posts = await db.all("SELECT * FROM posts WHERE mode != 'rant' ORDER BY created_at DESC");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Game Squad Route
app.get("/game-squad", async (req, res) => {
    try {
        const db = await dbPromise;
        const posts = await db.all("SELECT * FROM posts WHERE mode = 'game' ORDER BY created_at DESC");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Rant Zone Route
app.get("/rant-zone", async (req, res) => {
    try {
        const db = await dbPromise;
        const posts = await db.all("SELECT id, content, likes FROM posts WHERE mode = 'rant' ORDER BY created_at DESC");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Coin Flip Route
app.post("/api/coin-flip", async (req, res) => {
    try {
        const { userId, betAmount } = req.body;
        if (betAmount < 1 || betAmount > 100) {
            return res.status(400).json({ message: "Bet must be between 1 and 100 coins." });
        }

        const db = await dbPromise;
        const user = await db.get("SELECT coins FROM users WHERE id = ?", [userId]);
        if (!user || user.coins < betAmount) {
            return res.status(400).json({ message: "Insufficient coins." });
        }

        const isWin = Math.random() < 0.5;
        let newBalance = user.coins;
        let winnings = 0;

        if (isWin) {
            winnings = Math.floor(betAmount * 2 * 0.95); // 5% house cut
            newBalance += winnings;
        } else {
            newBalance -= betAmount;
        }

        await db.run("UPDATE users SET coins = ? WHERE id = ?", [newBalance, userId]);
        await db.run("INSERT INTO coin_flip_history (user_id, bet_amount, won_amount, result) VALUES (?, ?, ?, ?)", [userId, betAmount, winnings, isWin ? "win" : "lose"]);

        res.json({ result: isWin ? "win" : "lose", newBalance });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Hype Battle Post Route
app.post("/api/hype-battle", async (req, res) => {
    try {
        const { userId, content } = req.body;
        const db = await dbPromise;
        await db.run("INSERT INTO hype_battles (user_id, content, votes) VALUES (?, ?, ?)", [userId, content, 0]);
        res.json({ message: "Battle post created!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Vote for Battle Post Route
app.post("/api/vote-battle", async (req, res) => {
    try {
        const { userId, battleId } = req.body;
        const db = await dbPromise;

        const existingVote = await db.get("SELECT id FROM battle_votes WHERE user_id = ? AND battle_id = ?", [userId, battleId]);
        if (existingVote) {
            return res.status(400).json({ message: "You already voted for this battle!" });
        }

        await db.run("INSERT INTO battle_votes (user_id, battle_id) VALUES (?, ?)", [userId, battleId]);
        await db.run("UPDATE hype_battles SET votes = votes + 1 WHERE id = ?", [battleId]);

        res.json({ message: "Vote cast successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Determine Battle Winners after 24 hours
app.get("/api/determine-winners", async (req, res) => {
    try {
        const db = await dbPromise;
        const battles = await db.all("SELECT id, user_id, votes FROM hype_battles WHERE created_at < DATETIME('now', '-1 day')");

        for (const battle of battles) {
            const winnerId = battle.user_id;
            await db.run("UPDATE users SET coins = coins + 50 WHERE id = ?", [winnerId]);
            await db.run("UPDATE users SET title = NULL WHERE title = 'Rap King'");
            await db.run("UPDATE users SET title = 'Rap King' WHERE id = ?", [winnerId]);
            await db.run("UPDATE hype_battles SET closed = 1 WHERE id = ?", [battle.id]);
        }

        res.json({ message: "Winners determined and titles assigned!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Vote for Showdown Battle Date Route
app.post("/api/vote-showdown", async (req, res) => {
    try {
        const { userId, dateOption } = req.body;
        const db = await dbPromise;

        const existingVote = await db.get("SELECT id FROM showdown_votes WHERE user_id = ?", [userId]);
        if (existingVote) {
            return res.status(400).json({ message: "You have already voted!" });
        }

        await db.run("INSERT INTO showdown_votes (user_id, date_option) VALUES (?, ?)", [userId, dateOption]);
        res.json({ message: "Vote recorded!" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Determine the Next Showdown Date
app.get("/api/determine-showdown-date", async (req, res) => {
    try {
        const db = await dbPromise;
        const result = await db.get("SELECT date_option, COUNT(*) as votes FROM showdown_votes GROUP BY date_option ORDER BY votes DESC LIMIT 1");

        if (result) {
            await db.run("INSERT INTO scheduled_battles (date) VALUES (?)", [result.date_option]);
            res.json({ message: `Next battle scheduled for ${result.date_option}!` });
        } else {
            res.json({ message: "No votes yet." });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Track Likes and Check for Clout Missions Qualification
app.post('/track-like', async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const db = await dbPromise;
        await db.run('INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, datetime("now"))', [userId, postId]);

        const { count } = await db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ? AND created_at >= datetime("now", "-1 day")', [postId]);

        if (count >= 50) {
            await db.run('UPDATE users SET coins = coins + 100 WHERE id = ?', [userId]);
            await db.run('INSERT INTO hall_of_fame (user_id, total_likes) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET total_likes = total_likes + ?', [userId, count, count]);
        }

        res.json({ message: 'Like recorded', currentLikes: count });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Fetch Hall of Fame Rankings
app.get('/hall-of-fame', async (req, res) => {
    try {
        const db = await dbPromise;
        const rankings = await db.all('SELECT u.username, h.total_likes FROM hall_of_fame h JOIN users u ON h.user_id = u.id ORDER BY h.total_likes DESC');
        res.json(rankings);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
