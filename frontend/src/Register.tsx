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
            if (!email || !password || !dob) {
                setMessage("Please fill in all fields");
                return;
            }

            const formattedDob = new Date(dob).toISOString().split("T")[0];
            console.log("Sending registration data:", { email, password, dob: formattedDob });

            const res = await axios.post("/register", { email, password, dob: formattedDob });
            setMessage(res.data.message);
            if (res.status === 200) {
                localStorage.setItem("user", JSON.stringify({ email }));
                setTimeout(() => navigate("/"), 2000);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register for TeenVerse</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleRegister}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    Sign Up
                </button>
                <p className="text-center text-gray-600 mt-4">{message}</p>
                <p className="text-center text-gray-600 mt-2">
                    Already have an account? <a href="/" className="text-indigo-600 hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
        }
