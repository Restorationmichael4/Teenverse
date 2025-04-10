import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Add useParams and useNavigate
import { useAuth } from "../hooks/useAuth"; // Add useAuth
import Navigation from "../components/Navigation";

export default function SquadDetails() {
    const { squadId } = useParams<{ squadId: string }>(); // Get squadId from URL
    const navigate = useNavigate(); // For navigation
    const { user, token } = useAuth(); // Get user and token
    const [clips, setClips] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [matchTime, setMatchTime] = useState("");
    const [matchDescription, setMatchDescription] = useState("");
    const [clipUrl, setClipUrl] = useState("");
    const [clipDescription, setClipDescription] = useState("");
    const [message, setMessage] = useState("");
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMembership = async () => {
            if (!user || !token || !squadId) return;
            try {
                const userRes: any = await axios.get("https://teenverse.onrender.com/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userId = userRes.data.id;

                const isMemberRes: any = await axios.get(`https://teenverse.onrender.com/api/squad-messages/${squadId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (isMemberRes.status === 200) {
                    setIsMember(true);
                    setMessages(isMemberRes.data);
                }
            } catch (err) {
                setMessage("You must be a member of this squad to access this page.");
            }
        };

        const fetchClips = async () => {
            if (!user || !token || !squadId) return;
            try {
                const res = await axios.get(`https://teenverse.onrender.com/api/game-clips/${squadId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClips(res.data);
            } catch (err) {
                setMessage("Error fetching clips: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([checkMembership(), fetchClips()]);
            setLoading(false);
        };

        if (user && token && squadId) {
            fetchData();
            const interval = setInterval(checkMembership, 5000); // Poll messages every 5 seconds
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [user, token, squadId]);

    const handleSendMessage = async () => {
        if (!user || !token || !squadId) {
            setMessage("Please log in to send a message.");
            return;
        }
        if (!newMessage) {
            setMessage("Please enter a message.");
            return;
        }
        try {
            const res = await axios.post("https://teenverse.onrender.com/api/squad-messages", {
                email: user.email,
                squadId: parseInt(squadId),
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setNewMessage("");
            const messagesRes = await axios.get(`https://teenverse.onrender.com/api/squad-messages/${squadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(messagesRes.data);
        } catch (err) {
            setMessage("Error sending message: " + (err.response?.data?.message || err.message));
        }
    };

    const handleScheduleMatch = async () => {
        if (!user || !token || !squadId) {
            setMessage("Please log in to schedule a match.");
            return;
        }
        if (!matchTime || !matchDescription) {
            setMessage("Please provide a match time and description.");
            return;
        }
        const message = `🎮 Match Scheduled: ${matchDescription} at ${matchTime}`;
        try {
            const res = await axios.post("https://teenverse.onrender.com/api/squad-messages", {
                email: user.email,
                squadId: parseInt(squadId),
                message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setMatchTime("");
            setMatchDescription("");
            const messagesRes = await axios.get(`https://teenverse.onrender.com/api/squad-messages/${squadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(messagesRes.data);
        } catch (err) {
            setMessage("Error scheduling match: " + (err.response?.data?.message || err.message));
        }
    };

    const handleUploadClip = async () => {
        if (!user || !token || !squadId) {
            setMessage("Please log in to upload a clip.");
            return;
        }
        if (!clipUrl || !clipDescription) {
            setMessage("Please provide a clip URL and description.");
            return;
        }
        try {
            const res = await axios.post("https://teenverse.onrender.com/api/game-clips", {
                email: user.email,
                squadId: parseInt(squadId),
                clipUrl,
                description: clipDescription
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setClipUrl("");
            setClipDescription("");
            const clipsRes = await axios.get(`https://teenverse.onrender.com/api/game-clips/${squadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClips(clipsRes.data);
        } catch (err) {
            setMessage("Error uploading clip: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center text-red-500 text-xl">Please log in to access this squad.</div>
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

    if (!isMember) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{message}</p>
                    <button
                        onClick={() => navigate("/game-squad")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Game Squad
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Squad Details</h1>
                        <button
                            onClick={() => navigate("/game-squad")}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Back to Game Squad
                        </button>
                    </div>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Squad Chat</h2>
                        <p className="text-gray-600 mb-4">
                            Chat with your squad members here! Share strategies, plan matches, or just hang out. 😄
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto mb-4">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div key={msg.id} className="mb-2">
                                        <p className="text-gray-800 font-semibold">{msg.username}</p>
                                        <p className="text-gray-600">{msg.message}</p>
                                        <p className="text-gray-500 text-sm">{new Date(msg.created_at).toLocaleString()}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No messages yet. Start the conversation!</p>
                            )}
                        </div>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Send Message
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule a Match</h2>
                        <p className="text-gray-600 mb-4">
                            Plan a gaming session with your squad! Select a time and add a description.
                        </p>
                        <input
                            type="datetime-local"
                            value={matchTime}
                            onChange={(e) => setMatchTime(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <textarea
                            value={matchDescription}
                            onChange={(e) => setMatchDescription(e.target.value)}
                            placeholder="Match Description (e.g., Ranked match in CODM)"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <button
                            onClick={handleScheduleMatch}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Schedule Match
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload a Game Clip</h2>
                        <p className="text-gray-600 mb-4">
                            Share your best gaming moments! Paste a URL (e.g., YouTube link) and add a description.
                        </p>
                        <input
                            type="text"
                            value={clipUrl}
                            onChange={(e) => setClipUrl(e.target.value)}
                            placeholder="Clip URL (e.g., YouTube link)"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <textarea
                            value={clipDescription}
                            onChange={(e) => setClipDescription(e.target.value)}
                            placeholder="Clip Description"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                        />
                        <button
                            onClick={handleUploadClip}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Upload Clip
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Game Clips</h2>
                        {clips.length > 0 ? (
                            clips.map((clip) => (
                                <div key={clip.id} className="border-b py-4">
                                    <p className="text-gray-800 font-semibold">Uploaded by: {clip.username}</p>
                                    <p className="text-gray-600">{clip.description}</p>
                                    <a
                                        href={clip.clip_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Watch Clip
                                    </a>
                                    <p className="text-gray-500 text-sm">{new Date(clip.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No clips yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
                }
