import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            const res = await axios.post("/login", { email, password });
            setMessage(res.data.message);
            if (res.status === 200) {
                login({ email }, res.data.token);
                setTimeout(() => navigate("/dashboard"), 2000);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Error logging in");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to TeenVerse</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition"
                >
                    Log In
                </button>
                <p className="text-center text-gray-600 mt-4">{message}</p>
                <p className="text-center text-gray-600 mt-2">
                    Don't have an account? <a href="/register" className="text-purple-600 hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    );
                }
