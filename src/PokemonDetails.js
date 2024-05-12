import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PokemonDetails() {
  const { pokemonName } = useParams(); // Access URL parameters using useParams
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    // Fetch Pokemon details and evolution chain from the API
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        setPokemonDetails(response.data);

        // Fetch evolution chain data
        const speciesUrl = response.data.species.url;
        const speciesResponse = await axios.get(speciesUrl);
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);
        setEvolutionChain(parseEvolutionChain(evolutionChainResponse.data));

        // Retrieve the names of the top four moves from the fetched data
        const movesUrl = response.data.moves.slice(0, 4).map(move => move.move.name);
        setMoves(movesUrl);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [pokemonName]);

  // Function to parse evolution chain data
  const parseEvolutionChain = (chain) => {
    const stages = [];
    let currentStage = chain.chain;

    // Traverse the evolution chain and store objects with name and sprite
    while (currentStage) {
      stages.push({
        name: currentStage.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentStage.species.url.split("/")[6]}.png`,
      });
      currentStage = currentStage.evolves_to[0];
    }

    return stages;
  };

  // Render loading message if data is still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error message if there's an error
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render not found message if no pokemon details were found
  if (!pokemonDetails) {
    return <div>Pokemon details not found.</div>;
  }

  // Destructure pokemon detail object
  const { name, sprites, stats, types } = pokemonDetails;

  // Define background colors based on Pokemon types
  const typeColors = {
    normal: "#A8A878",
    fighting: "#C03028",
    flying: "#A890F0",
    poison: "#A040A0",
    ground: "#E0C068",
    rock: "#B8A038",
    bug: "#A8B820",
    ghost: "#705898",
    steel: "#B8B8D0",
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    psychic: "#F85888",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    fairy: "#EE99AC",
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex justify-center">
        {/* Display Pokemon's Name and Picture */}
        <div className="bg-gray-200 p-8 rounded-lg mb-6 flex flex-col items-center w-96">
          <h2 className="text-2xl font-bold mb-2">{name.toUpperCase()}</h2>
          {/* Display Pokemon's Types */}
          <div className="flex">
            {types.map((type, index) => (
              <span key={index} className={`text-white px-4 py-1 rounded-lg mx-2`} style={{ backgroundColor: typeColors[type.type.name] }}>
                {type.type.name}
              </span>
            ))}
          </div>
          {sprites && (
            <img
              src={sprites.front_default}
              alt={`Image of ${name}`}
              className="w-48 h-48 object-contain my-4"
            />
          )}
          <div className="mt-6 text-center">
            {/* Display Pokemon stats */}
            {stats.map((stat, index) => (
              <p key={index} className="text-lg">{stat.stat.name}: {stat.base_stat}</p>
            ))}
          </div>
        </div>
      </div>
      {/* Display evolutions*/}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{name.toUpperCase()}'S Evolutions</h2>
        <div className="flex justify-center">
          {evolutionChain.map((stage, index) => (
            <div key={index} className="flex flex-col items-center mr-4">
              <img src={stage.sprite} alt={`Sprite of ${stage.name}`} className="w-24 h-24 mb-2" />
              <p className="text-lg">{stage.name}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Display moves */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Top 4 Moves</h2>
        <div className="grid grid-cols-2 gap-4">
          {moves.map((move, index) => (
            <button key={index} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
