import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://pokeapi.co/api/v2"; // Base URL for the PokeAPI
const POKEMON_URL = BASE_URL + "/pokemon"; // Endpoint for fetching Pokemon data


function App() {
  // State variables to store Pokemon data, images, error, current page number, and total pages
  const [pokemonData, setPokemonData] = useState([]);
  const [pokemonImages, setPokemonImages] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Pokemon data from the API based on the current page
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data with pagination parameters
        const response = await axios.get(`${POKEMON_URL}?offset=${(currentPage - 1) * 20}&limit=20`);
        // Update Pokemon data and calculate total pages
        setPokemonData(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 20));

        // error handling
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [currentPage]);

  // Function to fetch Pokemon image given its URL
  const getPokemonImage = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data.sprites.front_default;
    } catch (error) {
      // Handle errors fetching images
      console.error("Error fetching Pokemon image:", error);
      return null;
    }
  };

  // Fetch Pokemon images when Pokemon data changes
  useEffect(() => {
    const fetchPokemonImages = async () => {
      const images = {};
      // Iterate through each Pokemon and fetch its image
      for (const pokemon of pokemonData) {
        const imageUrl = await getPokemonImage(pokemon.url);
        images[pokemon.name] = imageUrl;
      }
      // Update Pokemon images
      setPokemonImages(images);
    };

    fetchPokemonImages();
  }, [pokemonData]);

  // Handlers for navigating pages
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  // Render error message if there's an error
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  // Render loading message if data is still loading
  if (!pokemonData.length) {
    return <div>Loading...</div>;
  }

  // Render the Pokemon data, images, and pagination controls
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4 fixed top-0 left-0 right-0 z-10">PokeAPI Data</h1>
      <div className="flex flex-wrap gap-4">
        {/* Render each Pokemon as a card */}
        {pokemonData.map((pokemon, index) => (
          <div key={index} className="bg-gray-200 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold">{pokemon.name}</h2>
            {/* Render Pokemon image if available */}
            {pokemonImages[pokemon.name] && (
              <img
                src={pokemonImages[pokemon.name]}
                alt={`Image of ${pokemon.name}`}
                className="mt-2"
              />
            )}
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-between mt-4">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default App;
