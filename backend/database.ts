import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("users.db", (err) => {
    if (err) console.error("Database connection error:", err);
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    dob TEXT,
    verified INTEGER
)`);

// Create Users Table (with mode tracking)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    dob TEXT,
    mode TEXT DEFAULT 'main'
)`);

// Update Users Table to include coins
db.run(`ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
        console.error("Error updating users table:", err);
    }
});

// Create Posts Table (stores likes & expiration)
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mode TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Add XP, Level, Last Login, and Snitch Status to Users Table
db.run(`ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0`, (err) => {});
db.run(`ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1`, (err) => {});
db.run(`ALTER TABLE users ADD COLUMN last_login TEXT DEFAULT NULL`, (err) => {});
db.run(`ALTER TABLE users ADD COLUMN snitch_status TEXT DEFAULT 'clean'`, (err) => {});

-- Table for posts (news feed, game squad, and rant zone)
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    content TEXT NOT NULL,
    mode TEXT CHECK(mode IN ('main', 'undercover', 'rant')) NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for likes
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Table for badges
CREATE TABLE IF NOT EXISTS badges (
    user_id INTEGER PRIMARY KEY,
    news_king BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
