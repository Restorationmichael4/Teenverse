import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("users.db", (err) => {
    if (err) console.error("Database connection error:", err);
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,  -- Add username column
    password TEXT,
    dob TEXT,
    verified INTEGER,
    mode TEXT DEFAULT 'main',
    coins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_login TEXT DEFAULT NULL,
    snitch_status TEXT DEFAULT 'clean'
)`, (err) => {
    if (err) console.error("Error creating users table:", err);
});

// Create Posts Table (stores likes & expiration)
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,  -- Add username column to posts
    content TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mode TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) console.error("Error creating posts table:", err);
});

// Table for likes
db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) console.error("Error creating likes table:", err);
});

// Table for badges
db.run(`CREATE TABLE IF NOT EXISTS badges (
    user_id INTEGER PRIMARY KEY,
    news_king BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) console.error("Error creating badges table:", err);
});

// Table for coin flip history
db.run(`CREATE TABLE IF NOT EXISTS coin_flip_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    bet_amount INTEGER,
    won_amount INTEGER,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) console.error("Error creating coin flip history table:", err);
});

// Table for hype battles
db.run(`CREATE TABLE IF NOT EXISTS hype_battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
)`, (err) => {
    if (err) console.error("Error creating hype battles table:", err);
});

// Table for battle votes
db.run(`CREATE TABLE IF NOT EXISTS battle_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    battle_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(battle_id) REFERENCES hype_battles(id)
)`, (err) => {
    if (err) console.error("Error creating battle votes table:", err);
});

// Table for showdown votes
db.run(`CREATE TABLE IF NOT EXISTS showdown_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date_option TEXT
)`, (err) => {
    if (err) console.error("Error creating showdown votes table:", err);
});

// Table for scheduled battles
db.run(`CREATE TABLE IF NOT EXISTS scheduled_battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT
)`, (err) => {
    if (err) console.error("Error creating scheduled battles table:", err);
});
