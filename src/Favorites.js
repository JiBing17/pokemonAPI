import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import Header from './Header';

const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function Favorites() {
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {});
  const [pokemonDetails, setPokemonDetails] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      for (const name in favorites) {
        if (name && favorites[name]) {  // Ensure name is valid and is marked as a favorite
          try {
            console.log(name)
            const response = await axios.get(`${POKEMON_URL}/${name}`);
            details[name] = response.data;
          } catch (error) {
            console.error("Failed to fetch details for:", name, error);
          }
        }
      }
      setPokemonDetails(details);
    };
  
    fetchDetails();
  }, [favorites]);

  const removeFavorite = (name) => {
    const newFavorites = { ...favorites };
    delete newFavorites[name];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-wrap justify-center">
          {Object.keys(favorites).map((name, index) => (
            <Card key={index} className="bg-white shadow-md m-4 p-4 rounded-md w-72">
              <CardContent>
                <Typography variant="h5" component="h2" className="text-center">
                  {name.toUpperCase()}
                </Typography>
                {pokemonDetails[name] && (
                  <img
                    src={pokemonDetails[name].sprites.front_default}
                    alt={`Image of ${name}`}
                    className="w-32 h-32 mx-auto"
                  />
                )}
                <Button
                  onClick={() => removeFavorite(name)}
                  startIcon={<Favorite color="error" />}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
