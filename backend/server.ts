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

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
