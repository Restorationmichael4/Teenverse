import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

interface Ranking {
    username: string;
    total_likes: number;
}

export default function HallOfFame() {
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchRankings = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("/hall-of-fame", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRankings(res.data);
            } catch (err) {
                setMessage("Error fetching rankings: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchRankings();
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">
                Please log in to access the Hall of Fame.
                <div className="mt-4 text-gray-800">
                    Debug: user={JSON.stringify(user)}, token={token ? "Present" : "Missing"}
                </div>
            </div>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Hall of Fame</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Users</h2>
                        {rankings.length > 0 ? (
                            <ul className="space-y-4">
                                {rankings.map((user, index) => (
                                    <li key={index} className="text-gray-600">
                                        {user.username}: {user.total_likes} likes
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">No rankings available.</p>
                        )}
                        {message && <p className="text-red-500 mt-4">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
