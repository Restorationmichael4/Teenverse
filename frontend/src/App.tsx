import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CoinFlip from "./pages/CoinFlip";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/coin-flip" element={<CoinFlip userId={1} />} />
            </Routes>
        </Router>
    );
}
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RantZone from './pages/RantZone';
import GameSquad from './pages/GameSquad';
import CoinFlip from './pages/CoinFlip';
import HypeBattles from './pages/HypeBattles';
import UltimateShowdown from './pages/UltimateShowdown';
import CloutMissions from './pages/CloutMissions';
import HallOfFame from './pages/HallOfFame';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth'; // Custom hook for user auth

const App = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <Router>
      {isLoggedIn ? (
        <>
          <Navigation />
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/rant-zone" component={RantZone} />
            <Route path="/game-squad" component={GameSquad} />
            <Route path="/coin-flip" component={CoinFlip} />
            <Route path="/hype-battles" component={HypeBattles} />
            <Route path="/ultimate-showdown" component={UltimateShowdown} />
            <Route path="/clout-missions" component={CloutMissions} />
            <Route path="/hall-of-fame" component={HallOfFame} />
            <Redirect from="/" to="/home" />
          </Switch>
        </>
      ) : (
        <Route path="/" component={Login} />
      )}
    </Router>
  );
};

export default App;
export default App;
