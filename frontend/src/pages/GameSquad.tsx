import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";
import CoinFlip from "./CoinFlip";

interface GameSquad {
    id: number;
    game_name: string;
    uid: string;
    description: string;
    username: string;
    created_at: string;
    status: string;
    max_members: number;
    wins: number;
    creator_username?: string;
}

export default function GameSquad() {
    const [gameName, setGameName] = useState("");
    const [uid, setUid] = useState("");
    const [description, setDescription] = useState("");
    const [squads, setSquads] = useState<GameSquad[]>([]);
    const [leaderboard, setLeaderboard] = useState<GameSquad[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchSquads = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("https://teenverse.onrender.com/api/game-squads", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSquads(res.data);
            } catch (err) {
                setMessage("Error fetching squads: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchLeaderboard = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("https://teenverse.onrender.com/api/game-squads/leaderboard", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeaderboard(res.data);
            } catch (err) {
                setMessage("Error fetching leaderboard: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchSquads(), fetchLeaderboard()]);
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const handleCreateSquad = async () => {
        if (!user || !token) {
            setMessage("Please log in to create a squad.");
            return;
        }
        if (!gameName || !uid || !description) {
            setMessage("Please fill in all fields.");
            return;
        }
        try {
            const res = await axios.post("https://teenverse.onrender.com/api/game-squads", {
                email: user.email,
                gameName,
                uid,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setGameName("");
            setUid("");
            setDescription("");
            const squadsRes = await axios.get("https://teenverse.onrender.com/api/game-squads", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSquads(squadsRes.data);
        } catch (err) {
            setMessage("Error creating squad: " + (err.response?.data?.message || err.message));
        }
    };

    const handleJoinSquad = async (squadId: number) => {
        if (!user || !token) {
            setMessage("Please log in to join a squad.");
            return;
        }
        try {
            const res = await axios.post("https://teenverse.onrender.com/api/game-squads/join", {
                email: user.email,
                squadId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error joining squad: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center text-red-500 text-xl">Please log in to access the Game Squad.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-800 text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Game Squad</h1>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <CoinFlip />

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Game Squad</h2>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            placeholder="Game Name (e.g., CODM)"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <input
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            placeholder="Your UID"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (e.g., Looking for CODM players for ranked matches)"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <button
                            onClick={handleCreateSquad}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Create Squad
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Squad Leaderboard</h2>
                        {leaderboard.length > 0 ? (
                            <div className="space-y-4">
                                {leaderboard.map((squad, index) => (
                                    <div key={squad.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-gray-800 font-semibold">
                                                #{index + 1} {squad.game_name} Squad
                                            </p>
                                            <p className="text-gray-600">Created by: {squad.creator_username}</p>
                                            <p className="text-gray-600">Wins: {squad.wins}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No squads in the leaderboard yet.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Squads</h2>
                        {squads.length > 0 ? (
                            squads.map((squad) => (
                                <div key={squad.id} className="border-b py-4">
                                    <p className="text-gray-800 font-semibold">{squad.game_name} Squad</p>
                                    <p className="text-gray-600">Created by: {squad.username}</p>
                                    <p className="text-gray-600">UID: {squad.uid}</p>
                                    <p className="text-gray-600">{squad.description}</p>
                                    <p className="text-gray-500 text-sm">Status: {squad.status}</p>
                                    <p className="text-gray-500 text-sm">{new Date(squad.created_at).toLocaleString()}</p>
                                    {squad.status === "open" && (
                                        <button
                                            onClick={() => handleJoinSquad(squad.id)}
                                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Join Squad
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No game squads yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
                                                        }
