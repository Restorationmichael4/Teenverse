import React, { useEffect, useState } from 'react';

const HallOfFame = () => {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    fetch('/hall-of-fame')
      .then(res => res.json())
      .then(data => setRankings(data));
  }, []);

  return (
    <div>
      <h2>Hall of Fame</h2>
      <ul>
        {rankings.map((user, index) => (
          <li key={index}>{user.username}: {user.total_likes} likes</li>
        ))}
      </ul>
    </div>
  );
};

export default HallOfFame;
