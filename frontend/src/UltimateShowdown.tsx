import React, { useState } from "react";

const UltimateShowdown = ({ userId }: { userId: number }) => {
    const [vote, setVote] = useState("");

    const submitVote = async () => {
        await fetch("http://localhost:5000/api/vote-showdown", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, dateOption: vote })
        });
    };

    return (
        <div>
            <h2>Vote for Next Battle Date</h2>
            <select onChange={(e) => setVote(e.target.value)}>
                <option>Next Saturday</option>
                <option>Next Sunday</option>
            </select>
            <button onClick={submitVote}>Vote</button>
        </div>
    );
};

export default UltimateShowdown;
