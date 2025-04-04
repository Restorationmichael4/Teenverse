import { useEffect, useState } from "react";

export default function RantZone() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch("/rant-zone").then(res => res.json()).then(setPosts);
    }, []);

    const postRant = async () => {
        await fetch("/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: 0, content, mode: "rant" })
        });
        setContent("");
    };

    return (
        <div onContextMenu={e => e.preventDefault()}>
            <h1>Rant Zone</h1>
            <p>Screenshots are discouraged to protect privacy.</p>
            <textarea value={content} onChange={e => setContent(e.target.value)} />
            <button onClick={postRant}>Post Rant</button>
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
