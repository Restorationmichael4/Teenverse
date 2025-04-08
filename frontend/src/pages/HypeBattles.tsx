import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

interface Battle {
    id: number;
    content: string;
    username: string;
    created_at: string;
}

export default function HypeBattles() {
    const [battles, setBattles] = useState<Battle[]>([]);
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchBattles = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("/api/hype-battles", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBattles(res.data);
            } catch (err) {
                setMessage("Error fetching battles: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchBattles();
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const postBattle = async () => {
        if (!user || !token) {
            setMessage("Please log in to post a battle.");
            return;
        }
        try {
            await axios.post("/api/hype-battle", {
                email: user.email,
                content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContent("");
            const res = await axios.get("/api/hype-battles", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBattles(res.data);
            setMessage("Battle posted successfully!");
        } catch (err) {
            setMessage("Error posting battle: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">Please log in to access HYPE Battles.</div>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">HYPE Battles</h1>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Post a Battle</h2>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Challenge someone to a HYPE Battle!"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                        />
                        <button
                            onClick={postBattle}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            Post Battle
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Battles</h2>
                        {battles.length > 0 ? (
                            battles.map((battle) => (
                                <div key={battle.id} className="border-b py-4">
                                    <p className="text-gray-800 font-semibold">{battle.username}</p>
                                    <p className="text-gray-600">{battle.content}</p>
                                    <p className="text-gray-500 text-sm">{new Date(battle.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No battles yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
              }
