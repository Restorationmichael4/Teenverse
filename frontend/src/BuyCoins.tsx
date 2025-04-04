import { useState } from "react";
import axios from "axios";

export default function BuyCoins() {
    const [message, setMessage] = useState("");

    const handleBuy = () => {
        axios.post("http://localhost:5000/buy-coins")
            .then(res => setMessage(res.data.message))
            .catch(err => setMessage("Error processing request"));
    };

    return (
        <div>
            <h2>Buy Coins</h2>
            <button onClick={handleBuy}>Buy Coins (Not Available Yet)</button>
            <p>{message}</p>
        </div>
    );
}
