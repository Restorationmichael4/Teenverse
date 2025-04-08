import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

interface Post {
    id: number;
    username: string;
    content: string;
    mode: string;
    likes: number;
    created_at: string;
}

export default function RantZone() {
    const [rantContent, setRantContent] = useState("");
    const [message, setMessage] = useState("");
    const [rants, setRants] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchRants = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("/posts", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Ensure res.data is an array before filtering
                const posts = Array.isArray(res.data) ? res.data : [];
                const rantPosts = posts.filter((post: Post) => post.mode === "rant");
                setRants(rantPosts);
            } catch (err) {
                setMessage("Error fetching rants: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchRants();
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const handlePostRant = async () => {
        if (!user || !token) {
            setMessage("Please log in to post a rant.");
            return;
        }
        try {
            const res = await axios.post("/create-post", {
                email: user.email,
                content: rantContent,
                mode: "rant"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setRantContent("");
            const postsRes = await axios.get("/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure postsRes.data is an array before filtering
            const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
            const rantPosts = posts.filter((post: Post) => post.mode === "rant");
            setRants(rantPosts);
        } catch (err) {
            setMessage("Error posting rant: " + (err.response?.data?.message || err.message));
        }
    };

    const handleLike = async (postId: number) => {
        if (!user || !token) {
            setMessage("Please log in to like a rant.");
            return;
        }
        try {
            await axios.post("/like", {
                postId,
                email: user.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const postsRes = await axios.get("/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure postsRes.data is an array before filtering
            const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
            const rantPosts = posts.filter((post: Post) => post.mode === "rant");
            setRants(rantPosts);
        } catch (err) {
            setMessage("Error liking rant: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">
                Please log in to access the Rant Zone.
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
        <div onContextMenu={(e) => e.preventDefault()}>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Rant Zone</h1>
                    <p className="text-gray-600 mb-4">Screenshots are discouraged to protect privacy.</p>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Post a Rant</h2>
                        <textarea
                            value={rantContent}
                            onChange={(e) => setRantContent(e.target.value)}
                            placeholder="Let it all out!"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                        />
                        <button
                            onClick={handlePostRant}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Post Rant
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Rants</h2>
                        {rants.length > 0 ? (
                            rants.map((rant) => (
                                <div key={rant.id} className="border-b py-4">
                                    <p className="text-gray-800 font-semibold">{rant.username}</p>
                                    <p className="text-gray-600">{rant.content}</p>
                                    <p className="text-gray-500 text-sm">{new Date(rant.created_at).toLocaleString()}</p>
                                    <button
                                        onClick={() => handleLike(rant.id)}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        👍 {rant.likes || 0}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No rants yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
        }
