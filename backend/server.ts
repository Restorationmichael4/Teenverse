import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import postRoutes from './routes/posts';
import { db } from "./database";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "teenverse_secret";

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.post("/register", async (req, res) => {
    try {
        const { email, username, password, dob } = req.body;

        if (!email || !username || !password || !dob) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
            return res.status(400).json({ message: "Invalid date of birth format. Use YYYY-MM-DD." });
        }

        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 13 || age > 19) {
            return res.status(400).json({ message: "Get Out, Oldie. This Ain’t for You" });
        }

        const existingUser: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT email, username FROM users WHERE email = ? OR username = ?", [email, username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await new Promise<void>((resolve, reject) => {
            db.run(
                "INSERT INTO users (email, username, password, dob, verified) VALUES (?, ?, ?, ?, ?)",
                [email, username, hashedPassword, dob, 0],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ message: "Registered successfully!" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: user.email, verified: user.verified }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, message: "Login successful", username: user.username }); // Return username
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/toggle-mode", async (req, res) => {
    try {
        const { email } = req.body;
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT mode FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const newMode = user.mode === "main" ? "undercover" : "main";
        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE users SET mode = ? WHERE email = ?", [newMode, email], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: `Switched to ${newMode}` });
    } catch (err) {
        console.error("Toggle mode error:", err);
        res.status(500).json({ message: "Error updating mode" });
    }
});

app.post("/create-post", async (req, res) => {
    try {
        const { email, content, mode } = req.body;
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT id, username, mode, xp, coins FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        await new Promise<void>((resolve, reject) => {
            db.run(
                "INSERT INTO posts (user_id, username, content, mode) VALUES (?, ?, ?, ?)",
                [user.id, user.username, content, mode || user.mode],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        const newXP = user.xp + 5;
        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE users SET xp = ? WHERE id = ?", [newXP, user.id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        const newCoins = user.coins + 5;
        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE users SET coins = ? WHERE id = ?", [newCoins, user.id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: "Post created! +5 XP and +5 coins", newXP, newCoins });
    } catch (err) {
        console.error("Create post error:", err);
        res.status(500).json({ message: "Error creating post" });
    }
});

app.post("/get-coins", async (req, res) => {
    try {
        const { email } = req.body;
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT coins FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ coins: user.coins });
    } catch (err) {
        console.error("Get coins error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/buy-coins", (req, res) => {
    res.json({ message: "Buying coins is not available yet." });
});

app.post("/daily-login", async (req, res) => {
    try {
        const { email } = req.body;
        const today = new Date().toISOString().split("T")[0];
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT xp, last_login FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.last_login !== today) {
            const newXP = user.xp + 10;
            await new Promise<void>((resolve, reject) => {
                db.run(
                    "UPDATE users SET xp = ?, last_login = ? WHERE email = ?",
                    [newXP, today, email],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            return res.json({ message: "+10 XP for daily login!", newXP });
        }

        res.json({ message: "Already claimed XP today!" });
    } catch (err) {
        console.error("Daily login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/get-user-stats", async (req, res) => {
    try {
        const { email } = req.body;
        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT xp FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const { level, rank } = calculateLevel(user.xp);
        res.json({ xp: user.xp, level, rank });
    } catch (err) {
        console.error("Get user stats error:", err);
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
    db.all("SELECT id, xp FROM users", [], (err: Error | null, users: any[]) => {
        if (err) {
            console.error("Snitch status check error:", err);
            return;
        }
        users.forEach((user) => {
            db.get(
                "SELECT SUM(xp) as weekly_xp FROM posts WHERE user_id = ? AND created_at >= datetime('now', '-7 days')",
                [user.id],
                (err: Error | null, data: any) => {
                    if (err) {
                        console.error("Snitch status query error:", err);
                        return;
                    }
                    const weeklyXP = data?.weekly_xp || 0;
                    const snitchStatus = weeklyXP < 50 ? "Potential Snitch" : "clean";

                    db.run("UPDATE users SET snitch_status = ? WHERE id = ?", [snitchStatus, user.id], (err: Error | null) => {
                        if (err) console.error("Snitch status update error:", err);
                    });
                }
            );
        });
    });
}

setInterval(checkSnitchStatus, 86400000);

app.post("/post", async (req, res) => {
    try {
        const { userId, content, mode } = req.body;
        await new Promise<void>((resolve, reject) => {
            db.run(
                "INSERT INTO posts (user_id, content, mode) VALUES (?, ?, ?)",
                [userId, content, mode],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
        res.json({ message: "Post created" });
    } catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ message: "Error creating post" });
    }
});

app.post("/like", async (req, res) => {
    try {
        const { userId, postId } = req.body;
        await new Promise<void>((resolve, reject) => {
            db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        const post: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT likes, mode FROM posts WHERE id = ?", [postId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (post.likes >= 50 && post.mode === "undercover") {
            await new Promise<void>((resolve, reject) => {
                db.run("UPDATE posts SET created_at = NULL WHERE id = ?", [postId], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        const totalLikes: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT SUM(likes) as total FROM posts WHERE user_id = ?", [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (totalLikes.total >= 100) {
            await new Promise<void>((resolve, reject) => {
                db.run(
                    "INSERT INTO badges (user_id, news_king) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET news_king = 1",
                    [userId],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
        }

        res.json({ message: "Post liked" });
    } catch (err) {
        console.error("Like error:", err);
        res.status(400).json({ error: "Already liked" });
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all("SELECT * FROM posts WHERE mode != 'rant' ORDER BY created_at DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(posts);
    } catch (err) {
        console.error("Get posts error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/game-squad", async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all("SELECT * FROM posts WHERE mode = 'game' ORDER BY created_at DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(posts);
    } catch (err) {
        console.error("Get game squad error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/rant-zone", async (req, res) => {
    try {
        const posts: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all("SELECT id, username, content, likes FROM posts WHERE mode = 'rant' ORDER BY created_at DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(posts);
    } catch (err) {
        console.error("Get rant zone error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/coin-flip", async (req, res) => {
    try {
        const { userId, betAmount } = req.body;
        if (betAmount < 1 || betAmount > 100) {
            return res.status(400).json({ message: "Bet must be between 1 and 100 coins." });
        }

        const user: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT id, coins FROM users WHERE email = ?", [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user || user.coins < betAmount) {
            return res.status(400).json({ message: "Insufficient coins." });
        }

        const isWin = Math.random() < 0.5;
        let newBalance = user.coins;
        let winnings = 0;

        if (isWin) {
            winnings = Math.floor(betAmount * 2 * 0.95);
            newBalance += winnings;
        } else {
            newBalance -= betAmount;
        }

        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE users SET coins = ? WHERE id = ?", [newBalance, user.id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run(
                "INSERT INTO coin_flip_history (user_id, bet_amount, won_amount, result) VALUES (?, ?, ?, ?)",
                [user.id, betAmount, winnings, isWin ? "win" : "lose"],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ result: isWin ? "win" : "lose", newBalance });
    } catch (err) {
        console.error("Coin flip error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/hype-battle", async (req, res) => {
    try {
        const { userId, content } = req.body;
        await new Promise<void>((resolve, reject) => {
            db.run(
                "INSERT INTO hype_battles (user_id, content, votes) VALUES (?, ?, ?)",
                [userId, content, 0],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
        res.json({ message: "Battle post created!" });
    } catch (err) {
        console.error("Hype battle error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/vote-battle", async (req, res) => {
    try {
        const { userId, battleId } = req.body;
        const existingVote: any = await new Promise<any>((resolve, reject) => {
            db.get(
                "SELECT id FROM battle_votes WHERE user_id = ? AND battle_id = ?",
                [userId, battleId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (existingVote) {
            return res.status(400).json({ message: "You already voted for this battle!" });
        }

        await new Promise<void>((resolve, reject) => {
            db.run("INSERT INTO battle_votes (user_id, battle_id) VALUES (?, ?)", [userId, battleId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        await new Promise<void>((resolve, reject) => {
            db.run("UPDATE hype_battles SET votes = votes + 1 WHERE id = ?", [battleId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: "Vote cast successfully!" });
    } catch (err) {
        console.error("Vote battle error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/determine-winners", async (req, res) => {
    try {
        const battles: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all(
                "SELECT id, user_id, votes FROM hype_battles WHERE created_at < DATETIME('now', '-1 day')",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });

        for (const battle of battles) {
            const winnerId = battle.user_id;
            await new Promise<void>((resolve, reject) => {
                db.run("UPDATE users SET coins = coins + 50 WHERE id = ?", [winnerId], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            await new Promise<void>((resolve, reject) => {
                db.run("UPDATE users SET title = NULL WHERE title = 'Rap King'", [], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            await new Promise<void>((resolve, reject) => {
                db.run("UPDATE users SET title = 'Rap King' WHERE id = ?", [winnerId], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            await new Promise<void>((resolve, reject) => {
                db.run("UPDATE hype_battles SET closed = 1 WHERE id = ?", [battle.id], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        res.json({ message: "Winners determined and titles assigned!" });
    } catch (err) {
        console.error("Determine winners error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/vote-showdown", async (req, res) => {
    try {
        const { userId, dateOption } = req.body;
        const existingVote: any = await new Promise<any>((resolve, reject) => {
            db.get("SELECT id FROM showdown_votes WHERE user_id = ?", [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingVote) {
            return res.status(400).json({ message: "You have already voted!" });
        }

        await new Promise<void>((resolve, reject) => {
            db.run("INSERT INTO showdown_votes (user_id, date_option) VALUES (?, ?)", [userId, dateOption], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: "Vote recorded!" });
    } catch (err) {
        console.error("Vote showdown error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/determine-showdown-date", async (req, res) => {
    try {
        const result: any = await new Promise<any>((resolve, reject) => {
            db.get(
                "SELECT date_option, COUNT(*) as votes FROM showdown_votes GROUP BY date_option ORDER BY votes DESC LIMIT 1",
                [],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (result) {
            await new Promise<void>((resolve, reject) => {
                db.run("INSERT INTO scheduled_battles (date) VALUES (?)", [result.date_option], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            res.json({ message: `Next battle scheduled for ${result.date_option}!` });
        } else {
            res.json({ message: "No votes yet." });
        }
    } catch (err) {
        console.error("Determine showdown date error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/track-like', async (req, res) => {
    try {
        const { userId, postId } = req.body;
        await new Promise<void>((resolve, reject) => {
            db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        const result: any = await new Promise<any>((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM likes WHERE post_id = ? AND created_at >= datetime("now", "-1 day")',
                [postId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
        const count = result.count;

        if (count >= 50) {
            await new Promise<void>((resolve, reject) => {
                db.run('UPDATE users SET coins = coins + 100 WHERE id = ?', [userId], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
            await new Promise<void>((resolve, reject) => {
                db.run(
                    'INSERT INTO hall_of_fame (user_id, total_likes) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET total_likes = total_likes + ?',
                    [userId, count, count],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
        }

        res.json({ message: 'Like recorded', currentLikes: count });
    } catch (err) {
        console.error("Track like error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/hall-of-fame', async (req, res) => {
    try {
        const rankings: any[] = await new Promise<any[]>((resolve, reject) => {
            db.all('SELECT u.username, h.total_likes FROM hall_of_fame h JOIN users u ON h.user_id = u.id ORDER BY h.total_likes DESC', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(rankings);
    } catch (err) {
        console.error("Hall of fame error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
