import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PokemonDetails() {
  // Access URL parameters using useParams
  const { pokemonName } = useParams();
  
  // State variables for storing Pokemon details, loading status, and error
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch Pokemon details from the API
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        setPokemonDetails(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [pokemonName]);

  // Display loading message while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Display error message if an error occurs during data fetching
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Display message if Pokemon details are not found
  if (!pokemonDetails) {
    return <div>Pokemon details not found.</div>;
  }

  // Extract specific stats from the Pokemon details
  const stats = pokemonDetails.stats.reduce((acc, stat) => {
    if (stat.stat.name === "special-defense") {
      acc["Special Defense"] = stat.base_stat;
    } else if (stat.stat.name === "special-attack") {
      acc["Special Attack"] = stat.base_stat;
    } else {
      acc[stat.stat.name] = stat.base_stat;
    }
    return acc;
  }, {});

  const { name, sprites } = pokemonDetails;

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex items-center justify-center w-full mb-4">
        <h1 className="text-4xl font-bold py-4 text-center md:text-left md:ml-4 md:py-0 md:w-auto md:mr-auto">{name.toUpperCase()} Details</h1>
      </div>
      <div className="flex justify-center">
        <div className="bg-gray-200 p-8 rounded-lg mb-6 flex flex-col items-center w-96">
          <h2 className="text-2xl font-bold text-center mb-4">{name}</h2>
          {sprites && (
            <img
              src={sprites.front_default}
              alt={`Image of ${name}`}
              className="w-48 h-48 object-contain"
            />
          )}
          <div className="mt-6 text-center">
            {/* Display Pokemon stats */}
            {Object.entries(stats).map(([statName, value]) => (
              <p key={statName} className="text-lg">{statName}: {value}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
