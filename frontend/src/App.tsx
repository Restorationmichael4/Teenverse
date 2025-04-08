import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RantZone from './pages/RantZone';
import GameSquad from './pages/GameSquad';
import CoinFlip from './pages/CoinFlip';
import HypeBattles from './pages/HypeBattles';
import UltimateShowdown from './pages/UltimateShowdown';
import CloutMissions from './pages/CloutMissions';
import HallOfFame from './pages/HallofFame.tsx';
import Login from './pages/Login';
import Register from './Register';
import { useAuth } from './hooks/useAuth'; // Custom hook for user auth
import Dashboard from "./Dashboard";

const App = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <Router>
      {isLoggedIn ? (
        <>
          <Navigation />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/rant-zone" element={<RantZone />} />
            <Route path="/game-squad" element={<GameSquad />} />
            <Route path="/coin-flip" element={<CoinFlip />} />
            <Route path="/hype-battles" element={<HypeBattles />} />
            <Route path="/ultimate-showdown" element={<UltimateShowdown />} />
            <Route path="/clout-missions" element={<CloutMissions />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
