import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";

export default function BuyCoins() {
    const [message, setMessage] = useState("");
    const { user, token } = useAuth();

    const handleBuy = async () => {
        if (!user || !token) {
            setMessage("Please log in to buy coins.");
            return;
        }
        try {
            const res = await axios.post("/api/buy-coins", { email: user.email }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error processing request: " + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">Please log in to access Buy Coins.</div>
        </div>;
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Buy Coins</h1>
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Purchase Coins</h2>
                        <button
                            onClick={handleBuy}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Buy Coins (Not Available Yet)
                        </button>
                        <p className="text-gray-600 mt-4">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
                    }
