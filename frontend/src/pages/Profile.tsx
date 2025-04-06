import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [rank, setRank] = useState("Newbie");
    const [snitchStatus, setSnitchStatus] = useState("clean");
    const [email] = useState(localStorage.getItem("email"));
    const [mode, setMode] = useState("main");

    useEffect(() => {
        axios.post("http://localhost:5000/get-user-stats", { email })
            .then(res => {
                setXP(res.data.xp);
                setLevel(res.data.level);
                setRank(res.data.rank);
            })
            .catch(err => console.error(err));

        axios.post("http://localhost:5000/get-snitch-status", { email })
            .then(res => setSnitchStatus(res.data.snitchStatus))
            .catch(err => console.error(err));
        
        axios.post("http://localhost:5000/get-mode", { email })
            .then(res => setMode(res.data.mode))
            .catch(err => console.error(err));

        axios.post("http://localhost:5000/get-coins", { email })
            .then(res => setCoins(res.data.coins))
            .catch(err => console.error(err));
    }, []);

    const toggleMode = () => {
        axios.post("http://localhost:5000/toggle-mode", { email })
            .then(res => setMode(mode === "main" ? "undercover" : "main"))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Profile</h2>
            <p>💎 XP: {xp}</p>
            <p>📈 Level: {level}</p>
            <p>🏆 Rank: {rank}</p>
            {snitchStatus === "Potential Snitch" ? <p>🚨 Potential Snitch 🚨</p> : <p>✅ Verified</p>}
            <h2>Profile ({mode === "main" ? "Main" : "Undercover"})</h2>
            <button onClick={toggleMode}>
                Switch to {mode === "main" ? "Undercover" : "Main"} Mode
            </button>
        </div>
    );
                                         }
