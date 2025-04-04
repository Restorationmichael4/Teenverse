import { useEffect, useState } from "react";

export default function NewsFeed() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [mode, setMode] = useState("main");

    useEffect(() => {
        fetch("/posts").then(res => res.json()).then(setPosts);
    }, []);

    const postUpdate = async () => {
        await fetch("/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 1, content, mode })
        });
        setContent("");
    };

    return (
        <div>
            <h1>News Feed</h1>
            <textarea value={content} onChange={e => setContent(e.target.value)} />
            <select onChange={e => setMode(e.target.value)}>
                <option value="main">Main Mode</option>
                <option value="undercover">Undercover Mode</option>
            </select>
            <button onClick={postUpdate}>Post</button>
            {posts.map(post => (
                <div key={post.id}>
                    <p>{post.content}</p>
                    <button onClick={() => fetch("/like", { method: "POST", body: JSON.stringify({ postId: post.id, userId: 1 }) })}>
                        👍 {post.likes}
                    </button>
                </div>
            ))}
        </div>
    );
      }
