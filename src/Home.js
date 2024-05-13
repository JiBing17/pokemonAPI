import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 

const BASE_URL = "https://pokeapi.co/api/v2";
const POKEMON_URL = BASE_URL + "/pokemon";

function Home() {
  const [pokemonData, setPokemonData] = useState([]);
  const [pokemonImages, setPokemonImages] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPokemonData, setFilteredPokemonData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${POKEMON_URL}?offset=${(currentPage - 1) * 48}&limit=48`);
        setPokemonData(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 50));
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [currentPage]);

  const getPokemonImage = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data.sprites.front_default;
    } catch (error) {
      console.error("Error fetching Pokemon image:", error);
      return null;
    }
  };

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

  useEffect(() => {
    setFilteredPokemonData(
      pokemonData.filter(
        (pokemon) =>
          pokemon.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    );
  }, [pokemonData, searchQuery]);

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    setSearchQuery("");
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    setSearchQuery("");
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!pokemonData.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex items-center justify-center w-full my-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2 w-full md:w-64"
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center">
        {filteredPokemonData.map((pokemon, index) => (
          <Link to={`/pokemon/${pokemon.name}`} key={pokemon.name} className="text-black no-underline">
            <div className="bg-gray-200 p-6 rounded-lg mb-6 flex flex-col items-center w-72 md:w-96 mr-4 md:mb-4 relative">
              <span className="absolute top-0 right-0 text-sm font-bold text-gray-500 mt-2 mr-4">
                #{(currentPage - 1) * 48 + index + 1}
              </span>
              <h2 className="text-xl font-bold text-center mb-2">{pokemon.name}</h2>
              {pokemonImages[pokemon.name] && (
                <img
                  src={pokemonImages[pokemon.name]}
                  alt={`Image of ${pokemon.name}`}
                  className="mt-2 w-32 h-32 object-contain"
                />
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-8">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
          Previous
        </button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
          Next
        </button>
      </div>
    </div>
  );
}

export default Home;
