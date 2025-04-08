import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Post {
    id: number;
    username: string;
    content: string;
    mode: string;
    created_at: string;
}

export default function Dashboard() {
    const [content, setContent] = useState("");
    const [rantContent, setRantContent] = useState("");
    const [message, setMessage] = useState("");
    const [coinflipResult, setCoinflipResult] = useState("");
    const [mode, setMode] = useState("main");
    const [betAmount, setBetAmount] = useState(10);
    const [posts, setPosts] = useState<Post[]>([]);
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMode = async () => {
            try {
                const res = await axios.post("/toggle-mode", { email: user?.email }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMode(res.data.message.includes("main") ? "main" : "undercover");
            } catch (err) {
                setMessage("Error fetching mode: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchPosts = async () => {
            try {
                const res = await axios.get("/posts", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (err) {
                setMessage("Error fetching posts: " + (err.response?.data?.message || err.message));
            }
        };

        if (user && token) {
            fetchMode();
            fetchPosts();
        }
    }, [user, token]);

    const handlePost = async (isRant = false) => {
        try {
            const postContent = isRant ? rantContent : content;
            const modeToUse = isRant ? "rant" : mode;
            const res = await axios.post("/create-post", {
                email: user?.email,
                content: postContent,
                mode: modeToUse
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            if (isRant) setRantContent("");
            else setContent("");
            // Refresh posts after posting
            const postsRes = await axios.get("/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(postsRes.data);
        } catch (err) {
            setMessage("Error posting: " + (err.response?.data?.message || err.message));
        }
    };

    const handleToggleMode = async () => {
        try {
            const res = await axios.post("/toggle-mode", { email: user?.email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMode(res.data.message.includes("main") ? "main" : "undercover");
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error toggling mode: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCoinflip = async () => {
        try {
            const res = await axios.post("/api/coin-flip", {
                userId: user?.email,
                betAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoinflipResult(`Result: ${res.data.result}, New Balance: ${res.data.newBalance}`);
            setMessage("Coinflip completed!");
        } catch (err) {
            setMessage("Error in coinflip: " + (err.response?.data?.message || err.message));
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user || !token) {
        return <div className="text-center text-red-500">Please log in to access the dashboard.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome to TeenVerse, {user.username || user.email}!</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Log Out
                    </button>
                </div>

                <p className="text-center text-green-600 mb-6">{message}</p>

                {/* Post Section */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Post</h2>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                    />
                    <button
                        onClick={() => handlePost(false)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Post
                    </button>
                </div>

                {/* Rant Section */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Post a Rant</h2>
                    <textarea
                        value={rantContent}
                        onChange={(e) => setRantContent(e.target.value)}
                        placeholder="Let it all out!"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                    />
                    <button
                        onClick={() => handlePost(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Post Rant
                    </button>
                </div>

                {/* Display Posts */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Posts</h2>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} className="border-b py-4">
                                <p className="text-gray-800 font-semibold">{post.username}</p>
                                <p className="text-gray-600">{post.content}</p>
                                <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No posts yet.</p>
                    )}
                </div>

                {/* Profile Mode Section */}
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

                {/* Coinflip Section */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Coinflip Game</h2>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        min="1"
                        max="100"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                    />
                    <button
                        onClick={handleCoinflip}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Flip Coin
                    </button>
                    {coinflipResult && (
                        <p className="text-gray-600 mt-4">{coinflipResult}</p>
                    )}
                </div>
            </div>
        </div>
    );
                                            }
