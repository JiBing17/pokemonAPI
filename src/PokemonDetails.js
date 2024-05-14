import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { Grid, Card, CardContent, CardMedia, Chip } from "@mui/material";
import Typography from '@mui/material/Typography';

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

        const speciesUrl = response.data.species.url;
        const speciesResponse = await axios.get(speciesUrl);
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);
        setEvolutionChain(parseEvolutionChain(evolutionChainResponse.data));

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

  const { name, sprites, stats, types, id } = pokemonDetails;

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
    <div className="container mx-auto px-4 pt-20 mt-10">
      <div className="flex justify-center">
        {/* Display Pokemon's Name and Picture */}
        <Card sx={{ width: 400, borderRadius: 4, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            {/* Display Pokemon's Name */}
            <Typography variant="h5" component="div" gutterBottom style={{textAlign: 'center'}}>
              {name.toUpperCase()}
            </Typography>
            {/* Display Pokemon's ID */}
            <Typography variant="body2" color="text.secondary" sx={{ position: "absolute", top: 0, right: 0, marginTop: '7px', marginRight: '7px'}}>
              #{id}
            </Typography>
            {/* Display Pokemon's Types */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              {types.map((type, index) => (
                <Chip
                  key={index}
                  label={type.type.name}
                  sx={{ backgroundColor: typeColors[type.type.name], color: "white", marginRight: "5px" }}
                />
              ))}
            </div>
            {/* Display Pokemon's Image */}
            {sprites && (
              <CardMedia 
                component="img" 
                height="300" 
                image={sprites.other['official-artwork'].front_default} 
                alt={`Image of ${name}`} 
                style={{ imageRendering: 'pixelated'}} 
              />
            )}
            {/* Display Pokemon stats */}
            <div className="mt-6 text-center">
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="body2" color="text.secondary">{stat.stat.name}: {stat.base_stat}</Typography>
                  </Grid>
                ))}
              </Grid>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        {/* Display Pokemon's Evolutions */}
        <h2 className="text-2xl font-bold mb-4">{name.toUpperCase()}'S Evolutions</h2>
        <div className="flex justify-evenly">
          {evolutionChain.map((stage, index) => (
            <div key={index} className="flex flex-col items-center mr-4">
              <Link to={`/pokemon/${stage.name}`}>
                <img src={stage.sprite} alt={`Sprite of ${stage.name}`} className="w-40 h-40 mb-2" />
              </Link>
              <p className="text-lg">{stage.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        {/* Display Pokemon's Top 4 Moves */}
        <h2 className="text-2xl font-bold mb-4">Top 4 Moves</h2>
        <div className="grid grid-cols-2 gap-4 px-8 py-8">
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
