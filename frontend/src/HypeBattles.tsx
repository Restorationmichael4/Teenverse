import React, { useState, useEffect } from "react";

const HypeBattles = ({ userId }: { userId: number }) => {
    const [battles, setBattles] = useState([]);
    const [content, setContent] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/hype-battles")
            .then(res => res.json())
            .then(data => setBattles(data));
    }, []);

    const postBattle = async () => {
        await fetch("http://localhost:5000/api/hype-battle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, content })
        });
        setContent("");
    };

    return (
        <div>
            <h2>Hype Battles</h2>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            <button onClick={postBattle}>Post Battle</button>
        </div>
    );
};

export default HypeBattles;
