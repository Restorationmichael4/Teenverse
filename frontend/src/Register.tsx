import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            // Validate inputs
            if (!email || !password || !dob) {
                setMessage("Please fill in all fields");
                return;
            }

            // Log the data being sent
            console.log("Sending registration data:", { email, password, dob });

            const res = await axios.post("/register", { email, password, dob });
            setMessage(res.data.message);
            if (res.status === 200) {
                // Store user in localStorage
                localStorage.setItem("user", JSON.stringify({ email }));
                setTimeout(() => navigate("/"), 2000); // Redirect to login after 2 seconds
            }
        } catch (err) {
            console.error("Registration error:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
                setMessage(err.response.data?.message || "Error registering");
            } else if (err.request) {
                console.error("No response received:", err.request);
                setMessage("No response from server. Check your network.");
            } else {
                console.error("Error setting up request:", err.message);
                setMessage("Error: " + err.message);
            }
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
            />
            <button onClick={handleRegister}>Sign Up</button>
            <p>{message}</p>
            <p>
                Already have an account? <a href="/">Log in</a>
            </p>
        </div>
    );
                              }
