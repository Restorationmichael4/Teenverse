import { useEffect, useState } from "react";

export default function GameSquad() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch("/game-squad").then(res => res.json()).then(setPosts);
    }, []);

    return (
        <div>
            <h1>Game Squad</h1>
            {posts.map(post => (
                <div key={post.id}>
                    <p>{post.content}</p>
                </div>
            ))}
        </div>
    );
}
