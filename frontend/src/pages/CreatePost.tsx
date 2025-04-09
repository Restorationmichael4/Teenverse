import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

export default function CreatePost() {
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const { user, token } = useAuth();

    const handlePost = async () => {
        if (!user || !token) {
            setMessage("Please log in to post.");
            return;
        }
        try {
            const res = await axios.post("/api/create-post", {
                email: user.email,
                content,
                mode: "main"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message + " Check the Dashboard or News Feed to see your post.");
            setContent("");
        } catch (err) {
            setMessage("Error posting: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">
                Please log in to create a post.
                <div className="mt-4 text-gray-800">
                    Debug: user={JSON.stringify(user)}, token={token ? "Present" : "Missing"}
                </div>
            </div>
        </div>;
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Post</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Post</h2>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        />
                        <button
                            onClick={handlePost}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Post
                        </button>
                        <p className="text-gray-600 mt-4">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
