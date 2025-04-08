import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

export default function Profile() {
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [rank, setRank] = useState("Newbie");
    const [snitchStatus, setSnitchStatus] = useState("clean");
    const [coins, setCoins] = useState(0);
    const [mode, setMode] = useState("main");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user || !token) return;
            try {
                const statsRes = await axios.post("/get-user-stats", { email: user.email }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setXP(statsRes.data.xp);
                setLevel(statsRes.data.level);
                setRank(statsRes.data.rank);

                const snitchRes = await axios.post("/get-snitch-status", { email: user.email }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnitchStatus(snitchRes.data.snitchStatus);

                const modeRes = await axios.post("/toggle-mode", { email: user.email }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMode(modeRes.data.message.includes("main") ? "main" : "undercover");

                const coinsRes = await axios.post("/get-coins", { email: user.email }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCoins(coinsRes.data.coins);
            } catch (err) {
                setMessage("Error fetching profile data: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchUserStats();
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const handleToggleMode = async () => {
        if (!user || !token) {
            setMessage("Please log in to toggle mode.");
            return;
        }
        try {
            const res = await axios.post("/toggle-mode", { email: user.email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMode(res.data.message.includes("main") ? "main" : "undercover");
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error toggling mode: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">Please log in to access your profile.</div>
        </div>;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-800 text-xl">Loading...</div>
        </div>;
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Info</h2>
                        <p className="text-gray-600 mb-2">Email: {user.email}</p>
                        <p className="text-gray-600 mb-4">Username: {user.username || "Not set"}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Stats</h2>
                        <p className="text-gray-600 mb-2">💎 XP: {xp}</p>
                        <p className="text-gray-600 mb-2">📈 Level: {level}</p>
                        <p className="text-gray-600 mb-2">🏆 Rank: {rank}</p>
                        <p className="text-gray-600 mb-2">💰 Coins: {coins}</p>
                        {snitchStatus === "Potential Snitch" ? (
                            <p className="text-red-500">🚨 Potential Snitch 🚨</p>
                        ) : (
                            <p className="text-green-500">✅ Verified</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Mode</h2>
                        <p className="text-gray-600 mb-4">Current Mode: {mode}</p>
                        <button
                            onClick={handleToggleMode}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            Toggle to {mode === "main" ? "Undercover" : "Main"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
                        }
