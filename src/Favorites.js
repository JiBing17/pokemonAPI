import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import Header from './Header';

// Base URLs for API requests (backend)
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function Favorites() {
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {}); // State for storing the list of favorite Pokemon,
  const [pokemonDetails, setPokemonDetails] = useState({}); // State for storing details on each pokemon
  const [sortOrder, setSortOrder] = useState('recent'); // State for storing which sort order the client is currently on 

  // Effect to fetch Pokemon details when the list of favorites changes
  useEffect(() => {
    const fetchDetails = async () => {
      const details = {}; // Object used to store details for each pokemon name (key)
      for (const name in favorites) {
        try {
          const response = await axios.get(`${POKEMON_URL}/${name}`); // Axios call for data on that pokemon name (key)
          details[name] = response.data; // Set fetched data within the object with the corresponding pokemon name (key)
        } catch (error) {
          console.error("Failed to fetch details for:", name, error.message); // Error handeling if axios call failed
        }
      }
      setPokemonDetails(details);
    };
    fetchDetails();
  }, [favorites]);

  // Function to remove a Pokemon from favorites
  const removeFavorite = (name) => {
    const updatedFavorites = { ...favorites }; // Set updatedFavorites to current favorites
    delete updatedFavorites[name]; // Remove key-value from object
    setFavorites(updatedFavorites); // Update new favorites 
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Update new favorites from Local Storage
  };

  // Sorting favorites based on user selection
  const sortedFavorites = Object.keys(favorites).sort((a, b) => { // array containing the sorted data
    if (sortOrder === 'asc') {
      return a.localeCompare(b); // name ascending order
    } else if (sortOrder === 'desc') { 
      return b.localeCompare(a); // name descending order
    }
    return Object.keys(favorites).indexOf(a) - Object.keys(favorites).indexOf(b); // recent order

  });

  return (
    <div>
      {/* Header component for the page */}
      <Header />
      {/* Page title */}
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mt: 10, mb: 4 }}>
        Favorites
      </Typography>
      {/* Dropdown to select the sort order */}
      <FormControl variant="outlined" sx={{ m: 2, minWidth: 150, margin: 'auto' }}>
        <InputLabel id="sort-label">Sort By</InputLabel> {/* Dropdown Title */}
        {/* Dropdown Box */}
        <Select 
          labelId="sort-label"
          id="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          label="Sort By"
        >
          {/* Drop down items */}
          <MenuItem value="recent">Most Recent</MenuItem>
          <MenuItem value="asc">Name Ascending</MenuItem>
          <MenuItem value="desc">Name Descending</MenuItem>
        </Select>
      </FormControl>
  
      {/* Grid container for responsive card layout */}
      <Grid container spacing={2} justifyContent="center" sx={{ px: 3 }}>
        {sortedFavorites.map((name, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            {/* Card for each favorite Pokemon */}
            <Card className="bg-white shadow-md rounded-md">
              {/* Link to navigate to the PokemonDetails page */}
              <Link to={`/pokemon/${name}`} style={{ textDecoration: 'none' }}>
                <CardContent>
                  {/* Pokemon name displayed as card title */}
                  <Typography variant="h6" component="h2" className="text-center">
                    {name.toUpperCase()}
                  </Typography>
                  {/* Display Pokemon image */}
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
                  e.stopPropagation(); // Prevent link navigation when clicking the button
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
