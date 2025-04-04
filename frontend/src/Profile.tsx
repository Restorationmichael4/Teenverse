import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
    const [mode, setMode] = useState("main");
    const [email] = useState(localStorage.getItem("email"));

    useEffect(() => {
        axios.post("http://localhost:5000/get-mode", { email })
            .then(res => setMode(res.data.mode))
            .catch(err => console.error(err));
    }, []);

    const toggleMode = () => {
        axios.post("http://localhost:5000/toggle-mode", { email })
            .then(res => setMode(mode === "main" ? "undercover" : "main"))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Profile ({mode === "main" ? "Main" : "Undercover"})</h2>
            <button onClick={toggleMode}>
                Switch to {mode === "main" ? "Undercover" : "Main"} Mode
            </button>
        </div>
    );
}
