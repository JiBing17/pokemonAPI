import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PokemonDetails() {
  const { pokemonName } = useParams(); // Access URL parameters using useParams
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!pokemonDetails) {
    return <div>Pokemon details not found.</div>;
  }

  const { name, sprites, height, weight, base_experience } = pokemonDetails;

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex items-center justify-center w-full mb-4">
        <h1 className="text-4xl font-bold py-4 text-center md:text-left md:ml-4 md:py-0 md:w-auto md:mr-auto">{name.toUpperCase()} Details</h1>
      </div>
      <div className="flex justify-center">
        <div className="bg-gray-200 p-6 rounded-lg mb-6 flex flex-col items-center w-72">
          <h2 className="text-xl font-bold text-center mb-2">{name}</h2>
          {sprites && (
            <img
              src={sprites.front_default}
              alt={`Image of ${name}`}
              className="mt-2 w-32 h-32 object-contain"
            />
          )}
          <div className="mt-4">
            <p>Height: {height / 10} m</p>
            <p>Weight: {weight / 10} kg</p>
            <p>Base Experience: {base_experience}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
