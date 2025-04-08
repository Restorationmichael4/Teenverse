import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function UltimateShowdown() {
    const [vote, setVote] = useState("");
    const [message, setMessage] = useState("");
    const { user, token } = useAuth();

    const submitVote = async () => {
        if (!user || !token) {
            setMessage("Please log in to vote.");
            return;
        }
        if (!vote) {
            setMessage("Please select a date option.");
            return;
        }
        try {
            await axios.post("/api/vote-showdown", {
                email: user.email,
                dateOption: vote
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Vote submitted successfully!");
        } catch (err) {
            setMessage("Error submitting vote: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vote for Next Battle Date</h2>
            <select
                value={vote}
                onChange={(e) => setVote(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            >
                <option value="">Select a date</option>
                <option value="Next Saturday">Next Saturday</option>
                <option value="Next Sunday">Next Sunday</option>
            </select>
            <button
                onClick={submitVote}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
                Vote
            </button>
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
}
