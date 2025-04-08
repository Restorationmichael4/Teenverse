import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RantZone from "./pages/RantZone";
import GameSquad from "./pages/GameSquad";
import Profile from "./pages/Profile";
import NewsFeed from "./pages/NewsFeed";
import BuyCoins from "./pages/BuyCoins";
import HypeBattles from "./pages/HypeBattles";
import CloutMissions from "./pages/CloutMissions";
import HallOfFame from "./pages/HallOfFame";
import CreatePost from "./pages/CreatePost";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/rant-zone" element={<RantZone />} />
                    <Route path="/game-squad" element={<GameSquad />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/news-feed" element={<NewsFeed />} />
                    <Route path="/buy-coins" element={<BuyCoins />} />
                    <Route path="/hype-battles" element={<HypeBattles />} />
                    <Route path="/clout-missions" element={<CloutMissions />} />
                    <Route path="/hall-of-fame" element={<HallOfFame />} />
                    <Route path="/create-post" element={<CreatePost />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
