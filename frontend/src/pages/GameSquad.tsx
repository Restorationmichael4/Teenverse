import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";
import CoinFlip from "./CoinFlip";

export default function GameSquad() {
    const { user, token } = useAuth();

    if (!user || !token) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500 text-xl">Please log in to access the Game Squad.</div>
        </div>;
    }

    return (
        <div>
            <Navigation />
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Game Squad</h1>
                    <CoinFlip />
                </div>
            </div>
        </div>
    );
}
