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
