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
        <nav className="bg-indigo-600 p-4 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">TeenVerse</h1>
                <div className="flex space-x-4">
                    <Link to="/dashboard" className="text-white hover:text-indigo-200">Dashboard</Link>
                    <Link to="/rant-zone" className="text-white hover:text-indigo-200">Rant Zone</Link>
                    <Link to="/game-squad" className="text-white hover:text-indigo-200">Game Squad</Link>
                    <Link to="/coin-flip" className="text-white hover:text-indigo-200">Coin Flip</Link>
                    <Link to="/hype-battles" className="text-white hover:text-indigo-200">Hype Battles</Link>
                    <Link to="/ultimate-showdown" className="text-white hover:text-indigo-200">Ultimate Showdown</Link>
                    <Link to="/clout-missions" className="text-white hover:text-indigo-200">Clout Missions</Link>
                    <Link to="/hall-of-fame" className="text-white hover:text-indigo-200">Hall of Fame</Link>
                    <Link to="/profile" className="text-white hover:text-indigo-200">Profile</Link>
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="text-white hover:text-indigo-200"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/" className="text-white hover:text-indigo-200">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
