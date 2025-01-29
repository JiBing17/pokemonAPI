import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Box, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Header from './Header';
import pokeball from './static/pokeball.jpg';

// Base URLs for API requests (backend)
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = `${BASE_URL}/pokemon`;

function Favorites() {
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {});
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [sortOrder, setSortOrder] = useState('recent');
  const navigate = useNavigate(); // Hook for navigation

  // Fetch details for favorite Pokémon
  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      for (const name in favorites) {
        try {
          const { data } = await axios.get(`${POKEMON_URL}/${name}`);
          details[name] = data;
        } catch (error) {
          console.error("Failed to fetch details for:", name, error);
        }
      }
      setPokemonDetails(details);
    };
    fetchDetails();
  }, [favorites]);

  // Remove a Pokémon from favorites
  const removeFavorite = (name) => {
    const updatedFavorites = { ...favorites };
    delete updatedFavorites[name];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Sorting function based on user selection
  const handleSort = (a, b) => {
    if (sortOrder === 'asc') {
      return a.localeCompare(b); 
    } else if (sortOrder === 'desc') {
      return b.localeCompare(a); 
    }
    return 0; 
  };
  
  const sortedFavorites = Object.keys(favorites).sort(handleSort);

  return (
    <div>
      <Header />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "4rem 5%",
          gap: 4,
          marginTop: "4rem",
          flexWrap: "wrap", 
        }}
      >
        {/* Left Section: Title, Description, and Image */}
        <Box sx={{ width: { xs: "100%", md: "35%" }, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 2, fontWeight: "bold", color: "black" }}
          >
            Favorites
          </Typography>

          <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6, mb: 3 }}>
            Here you can view all your favorite Pokémon. Click on a Pokémon to
            view its details or remove it from your favorites.
          </Typography>

          {/* Pokéball Image Below Text */}
          <CardMedia
            component="img"
            image={pokeball} 
            alt="Pokéball illustration"
            sx={{
              width: "100%",
              maxWidth: "350px", 
              height: "auto",
              mx: "auto",
            }}
          />
        </Box>

        {/* Right Section: Sorting & Pokémon Grid */}
        <Box sx={{ flex: 1 }}>
          {/* Dropdown to select sorting order */}
          <FormControl variant="outlined" sx={{ minWidth: 150, mb: 3 }}>
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="asc">Name Ascending</MenuItem>
              <MenuItem value="desc">Name Descending</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional Rendering: If No Favorites, Show Message & Button */}
          {sortedFavorites.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                No favorites yet! Start adding Pokémon to your favorites.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")} // Navigate to home page
                sx={{
                  backgroundColor: "#C22E28",
                  color: "white",
                  "&:hover": { backgroundColor: "#B22222" },
                }}
              >
                Go to Home
              </Button>
            </Box>
          ) : (
            // If favorites exist, display Pokémon grid
            <Grid container spacing={2} justifyContent="flex-start">
              {sortedFavorites.map((name) => (
                <Grid item key={name} xs={12} sm={6} md={4} lg={3}>
                  {/* Card for each favorite Pokémon */}
                  <Card
                    sx={{
                      boxShadow: 3,
                      borderRadius: 2,
                      position: "relative",
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      },
                      backgroundColor: 'background.paper',
                    }}
                  >
                    {/* Remove from Favorites Button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(name);
                      }}
                      sx={{ position: 'absolute', top: 8, left: 8, color: 'error.main', zIndex: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>

                    {/* Clickable Card Link to Pokémon Details */}
                    <Link to={`/pokemon/${name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <CardContent>
                        {/* Pokémon Name */}
                        <Typography variant="h6" component="h2" gutterBottom align="center">
                          {name.toUpperCase()}
                        </Typography>
                        {/* Pokémon Image */}
                        {pokemonDetails[name] && (
                          <CardMedia
                            component="img"
                            image={pokemonDetails[name].sprites.other["official-artwork"].front_default}
                            alt={`Image of ${name}`}
                            sx={{ height: 150, objectFit: 'contain' }}
                          />
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default Favorites;
