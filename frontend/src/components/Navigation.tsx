// src/components/Navigation.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav style={navStyle}>
      <ul style={navListStyle}>
        <li><Link to="/home" style={linkStyle}>Home</Link></li>
        <li><Link to="/profile" style={linkStyle}>Profile</Link></li>
        <li><Link to="/rant-zone" style={linkStyle}>Rant Zone</Link></li>
        <li><Link to="/game-squad" style={linkStyle}>Game Squad</Link></li>
        <li><Link to="/coin-flip" style={linkStyle}>Coin Flip</Link></li>
        <li><Link to="/hype-battles" style={linkStyle}>Hype Battles</Link></li>
        <li><Link to="/ultimate-showdown" style={linkStyle}>Ultimate Showdown</Link></li>
        <li><Link to="/clout-missions" style={linkStyle}>Clout Missions</Link></li>
        <li><Link to="/hall-of-fame" style={linkStyle}>Hall of Fame</Link></li>
        <li><Link to="/logout" style={linkStyle}>Logout</Link></li>
      </ul>
    </nav>
  );
};

const navStyle = {
  backgroundColor: '#2C3E50',
  padding: '10px 0',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const navListStyle = {
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  listStyleType: 'none',
};

const linkStyle = {
  color: '#FFF',
  padding: '10px 20px',
  textDecoration: 'none',
  fontSize: '16px',
};

export default Navigation;
