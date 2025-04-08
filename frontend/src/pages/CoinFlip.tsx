import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function CoinFlip() {
    const [betAmount, setBetAmount] = useState(10);
    const [result, setResult] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const { user, token } = useAuth();

    const handleCoinFlip = async () => {
        if (!user || !token) {
            setMessage("Please log in to play the coinflip game.");
            return;
        }
        if (betAmount < 1 || betAmount > 100) {
            setMessage("Bet must be between 1 and 100 coins.");
            return;
        }

        try {
            const response = await axios.post("/api/coin-flip", {
                userId: user.email,
                betAmount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(response.data.result);
            setBalance(response.data.newBalance);
            setMessage("Coinflip completed!");
        } catch (err) {
            setMessage("Error in coinflip: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coin Flip Game</h2>
            <p className="text-gray-600 mb-4">
                Bet Amount:
                <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="ml-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </p>
            <button
                onClick={handleCoinFlip}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
                Flip Coin
            </button>
            {result && (
                <p className="mt-4 text-gray-600">
                    {result === "win" ? "🎉 You Won! 🎉" : "😢 You Lost! 😢"}
                </p>
            )}
            {balance !== null && <p className="mt-2 text-gray-600">Your new balance: {balance} coins</p>}
            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
