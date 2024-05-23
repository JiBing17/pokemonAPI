import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import Header from './Header';

// API URL for the backend
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function Home() {
  const [pokemonData, setPokemonData] = useState([]);
  const [pokemonImages, setPokemonImages] = useState({});
  const [error, setError] = useState(null);
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(location.state?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPokemonData, setFilteredPokemonData] = useState([]);

  // Fetch Pokemon data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${POKEMON_URL}?page=${currentPage}&limit=48`);
        setPokemonData(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 48));
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [currentPage]);

  // Fetch Pokemon images from the backend
  useEffect(() => {
    const fetchPokemonImages = async () => {
      const images = {};
      for (const pokemon of pokemonData) {
        const imageUrl = await getPokemonImage(pokemon.url);
        images[pokemon.name] = imageUrl;
      }
      setPokemonImages(images);
    };
    fetchPokemonImages();
  }, [pokemonData]);

  // Fetch a single Pokemon image given its URL
  const getPokemonImage = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data.sprites.front_default;
    } catch (error) {
      console.error("Error fetching Pokemon image:", error);
      return null;
    }
  };

  // Update filtered Pokemon data when search query or Pokemon data changes
  useEffect(() => {
    setFilteredPokemonData(
      pokemonData.filter(
        (pokemon) => pokemon.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    );
  }, [pokemonData, searchQuery]);

  // Handle previous page button click
  const handlePrevPage = () => {
    setCurrentPage((currPage) => Math.max(currPage - 1, 1));
    setSearchQuery("");
  };

  // Handle next page button click
  const handleNextPage = () => {
    setCurrentPage((currPage) => Math.min(currPage + 1, totalPages));
    setSearchQuery("");
  };

  // Handle search input change
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!pokemonData.length) {
    return <div>Loading...</div>;
  }

  console.log("currpage", currentPage);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex items-center justify-center w-full my-4">
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
          />
        </div>
        <div className="flex flex-wrap justify-center">
          {filteredPokemonData.map((pokemon, index) => (
            <Link
              to={{
                pathname: `/pokemon/${pokemon.name}`,
              }}
              state={{ fromPage: currentPage }} // store current pagination page number for back reference
              key={index}
              className="text-black no-underline"
            >
              <Card
                className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-col items-center w-72 md:w-96 mr-4 md:mb-4 relative"
                style={{ borderWidth: '1px', borderStyle: 'solid', boxShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h2"
                    className="text-xl font-bold text-center mb-2"
                    style={{textTransform: "uppercase"}}
                  >
                    {pokemon.name}
                  </Typography>
                  {pokemonImages[pokemon.name] && (
                    <img
                      src={pokemonImages[pokemon.name]}
                      alt={`Image of ${pokemon.name}`}
                      className="mt-2 w-32 h-32 object-contain"
                    />
                  )}
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
        {/* Pagination controls */}
        <Box display="flex" justifyContent="center" mt={4} gap={2}>
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            startIcon={<NavigateBefore />}
            style={{
              backgroundColor: '#C22E28',
              color: 'white',
              minWidth: '100px',
              maxWidth: '150px',
              flex: 1,
            }}
            variant="contained"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            endIcon={<NavigateNext />}
            style={{
              backgroundColor: '#C22E28',
              color: 'white',
              minWidth: '100px',
              maxWidth: '150px',
              flex: 1,
            }}
            variant="contained"
          >
            Next
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default Home;