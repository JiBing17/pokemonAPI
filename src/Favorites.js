import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import Header from './Header';

// Base URLs for API requests
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function Favorites() {
  // State for storing the list of favorite Pokémon and their details
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {});
  const [pokemonDetails, setPokemonDetails] = useState({});

  // Effect to fetch Pokémon details when the list of favorites changes
  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      for (const name in favorites) {
        try {
          const response = await axios.get(`${POKEMON_URL}/${name}`);
          details[name] = response.data;
        } catch (error) {
          console.error("Failed to fetch details for:", name, error.message);
        }
      }
      setPokemonDetails(details);
    };

    fetchDetails();
  }, [favorites]);

  // Function to remove a Pokémon from favorites
  const removeFavorite = (name) => {
    const updatedFavorites = { ...favorites };
    // remove key and value pair of the passed in name (key) and update
    delete updatedFavorites[name];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div>
      <Header />
      {/* Page title */}
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mt: 10, mb: 4 }}>
        Favorites
      </Typography>
      {/* Grid container for responsive card layout */}
      <Grid container spacing={2} justifyContent="center" sx={{ px: 3 }}>
        {Object.keys(favorites).filter(name => favorites[name]).map((name, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <Card className="bg-white shadow-md rounded-md">
              <Link to={`/pokemon/${name}`} style={{ textDecoration: 'none'}}> {/* Make card a link */}
                <CardContent>
                  {/* Pokémon name displayed as card title */}
                  <Typography variant="h6" component="h2" className="text-center">
                    {name.toUpperCase()}
                  </Typography>
                  {/* Display Pokémon image */}
                  {pokemonDetails[name] && (
                    <img
                      src={pokemonDetails[name].sprites.front_default}
                      alt={`Image of ${name}`}
                      className="w-full"
                      style={{ height: '200px', objectFit: 'contain' }}
                    />
                  )}
                </CardContent>
              </Link>
              {/* Button to remove Pokémon from favorites */}
              <Button
                fullWidth
                onClick={(e) => {
                  // Prevent link navigation when clicking the button
                  e.stopPropagation(); 
                  removeFavorite(name);
                }}
                startIcon={<Favorite color="error" />}
                sx={{ mt: 2 }}
              >
                Remove
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Favorites;
