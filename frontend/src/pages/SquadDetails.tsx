import { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";

interface SquadDetailsProps {
    squadId: number;
    clips: any[];
    setClips: (clips: any[]) => void;
    setMessage: (message: string) => void;
    user: { email: string; username?: string } | null;
    token: string | null;
    handleUploadClip: (squadId: number) => void;
    clipUrl: string;
    setClipUrl: (url: string) => void;
    clipDescription: string;
    setClipDescription: (description: string) => void;
}

export default function SquadDetails({
    squadId,
    clips,
    setClips,
    setMessage,
    user,
    token,
    handleUploadClip,
    clipUrl,
    setClipUrl,
    clipDescription,
    setClipDescription
}: SquadDetailsProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [matchTime, setMatchTime] = useState("");
    const [matchDescription, setMatchDescription] = useState("");

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get(`https://teenverse.onrender.com/api/squad-messages/${squadId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                setMessage("Error fetching messages: " + (err.response?.data?.message || err.message));
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [user, token, squadId, setMessage]);

    const handleSendMessage = async () => {
        if (!user || !token) {
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
                squadId,
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
        if (!user || !token) {
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
                squadId,
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

    if (!user || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center text-red-500 text-xl">Please log in to access this squad.</div>
            </div>
        );
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Squad Details</h1>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Squad Chat</h2>
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
                                <p className="text-gray-600">No messages yet.</p>
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
                            onClick={() => handleUploadClip(squadId)}
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
