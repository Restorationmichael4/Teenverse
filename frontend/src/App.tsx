import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RantZone from "./pages/RantZone";
import GameSquad from "./pages/GameSquad";
import Profile from "./pages/Profile";
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
                </Routes>
            </Router>
        </AuthProvider>
    );
}
