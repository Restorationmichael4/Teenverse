import { useState } from "react";
import axios from "axios";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async () => {
        try {
            const res = await axios.post("http://localhost:5000/register", { email, password, dob });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error registering");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <input type="date" onChange={(e) => setDob(e.target.value)} />
            <button onClick={handleRegister}>Sign Up</button>
            <p>{message}</p>
        </div>
    );
}
