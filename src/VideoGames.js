// VideoGames.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VideoGames() {
  const [games, setGames] = useState([]);

  const API_KEY = '';
  const searchQuery = 'pokemon';

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://api.rawg.io/api/games', {
          params: {
            key: API_KEY,
            search: searchQuery,
          },
        });
        setGames(response.data.results);
      } catch (error) {
        console.error('Error fetching video games:', error);
      }
    };

    fetchGames();
  }, [API_KEY]);


  return (
    <></>
  );
}

export default VideoGames;
