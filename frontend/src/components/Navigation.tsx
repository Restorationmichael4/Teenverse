import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="bg-indigo-600 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">TeenVerse</h1>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-white">Welcome, {user.username || user.email}!</span>
                            <Link to="/dashboard" className="text-white hover:text-indigo-200">Dashboard</Link>
                            <Link to="/news-feed" className="text-white hover:text-indigo-200">News Feed</Link>
                            <Link to="/rant-zone" className="text-white hover:text-indigo-200">Rant Zone</Link>
                            <Link to="/game-squad" className="text-white hover:text-indigo-200">Game Squad</Link>
                            <Link to="/hype-battles" className="text-white hover:text-indigo-200">HYPE Battles</Link>
                            <Link to="/clout-missions" className="text-white hover:text-indigo-200">Clout Missions</Link>
                            <Link to="/hall-of-fame" className="text-white hover:text-indigo-200">Hall of Fame</Link>
                            <Link to="/buy-coins" className="text-white hover:text-indigo-200">Buy Coins</Link>
                            <Link to="/profile" className="text-white hover:text-indigo-200">Profile</Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-white hover:text-indigo-200">Login</Link>
                            <Link to="/register" className="text-white hover:text-indigo-200">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
