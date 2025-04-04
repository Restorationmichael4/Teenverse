import React, { useState } from "react";

const CoinFlip = ({ userId }: { userId: number }) => {
    const [betAmount, setBetAmount] = useState(10);
    const [result, setResult] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);

    const handleCoinFlip = async () => {
        if (betAmount < 1 || betAmount > 100) {
            alert("Bet must be between 1 and 100 coins.");
            return;
        }

        const response = await fetch("http://localhost:5000/api/coin-flip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, betAmount })
        });

        const data = await response.json();
        if (response.ok) {
            setResult(data.result);
            setBalance(data.newBalance);
        } else {
            alert(data.message);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Coin Flip Game</h2>
            <p>Bet Amount: 
                <input 
                    type="number" 
                    value={betAmount} 
                    onChange={(e) => setBetAmount(Number(e.target.value))} 
                    min="1" max="100"
                />
            </p>
            <button onClick={handleCoinFlip}>Flip Coin</button>
            {result && (
                <p style={{ marginTop: "20px" }}>
                    {result === "win" ? "🎉 You Won! 🎉" : "😢 You Lost! 😢"}
                </p>
            )}
            {balance !== null && <p>Your new balance: {balance} coins</p>}
        </div>
    );
};

export default CoinFlip;
