import { useEffect, useState } from "react";
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

export default function NewsFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState("");
    const [mode, setMode] = useState("main");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user || !token) return;
            try {
                const res = await axios.get("/api/posts", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (err) {
                setMessage("Error fetching posts: " + (err.response?.data?.message || err.message));
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchPosts();
            setLoading(false);
        };

        if (user && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const postUpdate = async () => {
        if (!user || !token) {
            setMessage("Please log in to post.");
            return;
        }
        try {
            const res = await axios.post("/create-post", {
                email: user.email,
                content,
                mode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            setContent("");
            const postsRes = await axios.get("/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(postsRes.data);
        } catch (err) {
            setMessage("Error posting: " + (err.response?.data?.message || err.message));
        }
    };

    const handleLike = async (postId: number) => {
        if (!user || !token) {
            setMessage("Please log in to like a post.");
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
            setPosts(postsRes.data);
        } catch (err) {
            setMessage("Error liking post: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">
                Please log in to access the News Feed.
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">News Feed</h1>
                    <p className="text-center text-green-600 mb-6">{message}</p>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Post</h2>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        >
                            <option value="main">Main Mode</option>
                            <option value="undercover">Undercover Mode</option>
                        </select>
                        <button
                            onClick={postUpdate}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Post
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Posts</h2>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="border-b py-4">
                                    <p className="text-gray-800 font-semibold">{post.username}</p>
                                    <p className="text-gray-600">{post.content}</p>
                                    <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        👍 {post.likes || 0}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No posts yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
              }
