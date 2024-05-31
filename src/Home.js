import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { NavigateBefore, NavigateNext , Favorite, FavoriteBorder} from '@mui/icons-material';
import Header from './Header';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// API URL for the backend
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function Home() {
  // States need to store relevant data
  const [pokemonData, setPokemonData] = useState([]);
  const [pokemonImages, setPokemonImages] = useState({});
  const [error, setError] = useState(null);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.state?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPokemonData, setFilteredPokemonData] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {}); 
  const [sortOrder, setSortOrder] = useState('Index Order'); 

  // Fetch Pokemon data from the backend each time curent page state changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${POKEMON_URL}?page=${currentPage}&limit=48`); // Axios call to fetch data on first 48 pokemons 
        setPokemonData(response.data.results); // Set pokemon data state to the fetched result
        setTotalPages(Math.ceil(response.data.count / 48)); // update total pages
      } catch (error) { // Error handeling if Axios call failed
        setError(error);
      }
    };
    fetchData();
  }, [currentPage]);

  // Fetch Pokemon images from the backend each time pokemon data state changes
  useEffect(() => {
    const fetchPokemonImages = async () => {
      const images = {}; // image object used to store url pic of the corresponding pokemon's name (key)
      for (const pokemon of pokemonData) {  // Loops through each pokemon object 
        const imageUrl = await getPokemonImage(pokemon.url); // Helper function to get pokemon's image URL using pokemon.url property 
        images[pokemon.name] = imageUrl; // hashes pokemon name as key with value as the image URL on pokemon 
      }
      setPokemonImages(images); // Sets pokemon image state as images object
    };
    fetchPokemonImages();
  }, [pokemonData]);

  // Fetch a single Pokemon image given its URL
  const getPokemonImage = async (url) => {
    try {
      const response = await axios.get(url); // Axios call to fetched data on passed in pokemon URL
      return response.data.sprites.front_default; // Returns image URL of the fetched data
    } catch (error) {
      console.error("Error fetching Pokemon image:", error); // Error handeling if Axios failed
      return null;
    }
  };

  // Filter out pokemon data based on search, index sort, name ascending sort, and name descending sort
  useEffect(() => {

    // Filtered by search first
    let filtered = pokemonData.filter(pokemon =>
      pokemon.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
    // Sort by name if that option is chosen
    if (sortOrder === 'Name Ascending') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Sort by name if that option is chosen
    if (sortOrder === 'Name Descending') {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    // Default sort : Pokedex Order
  
    setFilteredPokemonData(filtered);
  }, [pokemonData, searchQuery, sortOrder]);

  // Handle previous page button click
  const handlePrevPage = () => {
    setCurrentPage((currPage) => Math.max(currPage - 1, 1)); // Update current page state
    setSearchQuery(""); // Clear search bar after paginating back
  };

  // Handle next page button click
  const handleNextPage = () => {
    setCurrentPage((currPage) => Math.min(currPage + 1, totalPages)); // Update current page state
    setSearchQuery(""); // Clear search bar after paginating forward
  };

  // Handle search input change
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value); // set search state to search bar value
  };

  // Handles state of favorites
  const toggleFavorite = (name) => {
    const updatedFavorites = { ...favorites }; // set updatedFavorites to current favorites
    if (favorites[name]) {
      delete updatedFavorites[name]; // If it's currently a favorite, remove it.
    } else {
      updatedFavorites[name] = true; // If it's not a favorite, add it to object with value of true
    }
    setFavorites(updatedFavorites); // Update favorites state
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Update local storage of favorites
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!pokemonData.length) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {/* Header component for the page */}
      <Header />
      {/* Main container with padding and margin adjustments */}
      <div className="container mx-auto px-4 pt-20">
        {/* Search and Sort Controls */}
        <div className="flex items-center justify-center w-full my-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={handleSearchInputChange} // Sets search state when changes are made to search bar
            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
          />
          {/* Sort Dropdown */}
          <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-select"
              value={sortOrder}
              label="Sort By"
              onChange={(e) => setSortOrder(e.target.value)} // Sets sort order when changes are made to dropdown box
            >
              {/* Sort Dropdown Options */}
              <MenuItem value="Index Order">Index Order</MenuItem>
              <MenuItem value="Name Ascending">Name Ascending</MenuItem>
              <MenuItem value="Name Descending">Name Descending</MenuItem>
            </Select>
          </FormControl>
        </div>
        {/* Display Pokémon Cards */}
        <div className="flex flex-wrap justify-center">
          {filteredPokemonData.map((pokemon, index) => ( // Based on current filtered data
            <Link // Link used for routing to PokemonDetails component
              to={{
                pathname: `/pokemon/${pokemon.name}`,
              }}
              state={{ fromPage: currentPage }} // Store current pagination page number for back reference
              key={index}
              className="text-black no-underline"
            >
              {/* Pokemon Card */}
              <Card
                className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-col items-center w-72 md:w-96 mr-4 md:mb-4 relative"
                style={{ borderWidth: '1px', borderStyle: 'solid', boxShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}
              >
                {/* Favorite Button */}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(pokemon.name); // Updates favorites state based on passed in key
                  }}
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                >
                  {favorites[pokemon.name] ? <Favorite color="error" /> : <FavoriteBorder />} {/* Renders either filled or empty heart if key (name) in object */}
                </Button>
                {/* Card Content */}
                <CardContent>
                  {/* Pokemon Name */}
                  <Typography
                    variant="h5"
                    component="h2"
                    className="text-xl font-bold text-center mb-2"
                    style={{ textTransform: "uppercase" }}
                  >
                    {pokemon.name}
                  </Typography>
                  {/* Pokemon Image */}
                  {pokemonImages[pokemon.name] && (
                    <img
                      src={pokemonImages[pokemon.name]}
                      alt={`Image of ${pokemon.name}`}
                      className="mt-2 w-32 h-32 object-contain"
                    />
                  )}
                  {/* Pokemon Index */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                    className="text-sm font-bold text-gray-500"
                  >
                    #{(currentPage - 1) * 48 + index + 1}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {/* Pagination Controls */}
        <Box sx={{ // Displayed on far left middle
            position: 'fixed', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            left: 0, 
            zIndex: 1000, 
            ml: { xs: 1, sm: 2 }  
        }}>
          <Button
            onClick={handlePrevPage} // Goes back a pagination back
            disabled={currentPage === 1} // Disabled when on first page
            sx={{
                backgroundColor: '#C22E28',
                color: 'white',
                '&:disabled': {
                    backgroundColor: 'rgba(194, 46, 40, 0.5)'
                },
                minWidth: { xs: '30px', sm: '40px' }, 
                padding: { xs: '6px 8px', sm: '8px 16px' },
                '&:hover': { backgroundColor: '#B22222' } 
            }}
            variant="contained"
            startIcon={<NavigateBefore />}
          />
        </Box>
        <Box sx={{  // Displayed on far right middle
            position: 'fixed', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            right: 0, 
            zIndex: 1000, 
            mr: { xs: 1, sm: 2 } 
             
        }}>
          <Button
            onClick={handleNextPage} // Goes forward a pagination back
            disabled={currentPage === totalPages} // Disabled when on last page
            sx={{
                backgroundColor: '#C22E28',
                color: 'white',
                '&:disabled': {
                    backgroundColor: 'rgba(194, 46, 40, 0.5)'
                },
                minWidth: { xs: '30px', sm: '40px' },  
                padding: { xs: '6px 8px', sm: '8px 16px' }, 
                '&:hover': { backgroundColor: '#B22222' }
            }}
            variant="contained"
            endIcon={<NavigateNext />}
          />
        </Box>
      </div>
    </div>
  );
}
export default Home;