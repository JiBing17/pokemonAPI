import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';

// Base URLs for API requests (backend)
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = `${BASE_URL}/pokemon`;

function Favorites() {
  // State for storing the list of favorite Pokemon
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {});
  // State for storing details on each pokemon
  const [pokemonDetails, setPokemonDetails] = useState({});
  // State for storing which sort order the client is currently on
  const [sortOrder, setSortOrder] = useState('recent');

  // Effect to fetch Pokemon details when the list of favorites changes
  useEffect(() => {
    const fetchDetails = async () => {
      const details = {}; // Object used to store details for each pokemon name (key)
      for (const name in favorites) {
        try {
          const { data } = await axios.get(`${POKEMON_URL}/${name}`); // Axios call for data on that pokemon name (key)
          details[name] = data; // Set fetched data within the object with the corresponding pokemon name (key)
        } catch (error) {
          console.error("Failed to fetch details for:", name, error); // Error handling if axios call failed
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
  const handleSort = (a, b) => {
    if (sortOrder === 'asc') {
      return a.localeCompare(b); // name ascending order
    } else if (sortOrder === 'desc') {
      return b.localeCompare(a); // name descending order
    }
    return 0; // recent order
  };
  const sortedFavorites = Object.keys(favorites).sort(handleSort); // array containing the sorted data

  return (
    <div>
      {/* Header component for the page */}
      <Header />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 15, justifyContent: 'center', gap: 3, width: '90%', mx: 'auto' }}>
        {/* Page title */}
        <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          Favorites
        </Typography>
        {/* Dropdown to select the sort order */}
        <FormControl variant="outlined" sx={{ minWidth: 150, mb: 4 }}>
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
      </Box>
      {/* Grid container for responsive card layout */}
      <Grid container spacing={2} justifyContent="center" sx={{ px: 3, py: 3 }}>
        {sortedFavorites.map((name) => (
          <Grid item key={name} xs={12} sm={6} md={4} lg={3}>
            {/* Card for each favorite Pokemon */}
            <Card sx={{
              boxShadow: 3,
              borderRadius: 2,
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.05)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
              },
              backgroundColor: 'background.paper'
            }}>
              {/* Link to navigate to the PokemonDetails page */}
              <Link to={`/pokemon/${name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardContent>
                  {/* Pokemon name displayed as card title */}
                  <Typography variant="h6" component="h2" gutterBottom align="center">
                    {name.toUpperCase()}
                  </Typography>
                  {/* Display Pokemon image */}
                  {pokemonDetails[name] && (
                    <CardMedia
                      component="img"
                      image={pokemonDetails[name].sprites.front_default}
                      alt={`Image of ${name}`}
                      sx={{ height: 150, objectFit: 'contain' }}
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
                startIcon={<DeleteIcon sx={{ color: 'black' }} />}
                sx={{ mt: 1, borderColor: 'primary.main', color: 'black' }} // Added color style here
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
