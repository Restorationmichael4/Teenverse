import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

export default function CloutMissions() {
    const [mission, setMission] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchMission = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("/api/clout-missions", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMission(res.data.mission);
            } catch (err) {
                setMessage("Error fetching mission: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchMission();
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
            <div className="text-center text-red-500 text-xl">Please log in to access Clout Missions.</div>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Clout Missions</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Mission</h2>
                        <p className="text-gray-600">{mission || "Mission: Get 50 Likes in 24 Hours for 100 Coins"}</p>
                        <p className="text-gray-600 mt-2">Check the <a href="/hall-of-fame" className="text-indigo-600 hover:underline">Hall of Fame</a> to see top users!</p>
                        {message && <p className="text-red-500 mt-4">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
