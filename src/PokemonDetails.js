import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Grid, Card, CardContent, CardMedia, Chip, Button, Box, LinearProgress, Typography } from "@mui/material";
import Header from "./Header";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

// API URL for the backend
const BASE_URL = "http://localhost:5000/api";
const POKEMON_URL = BASE_URL + "/pokemon";

function PokemonDetails() {
  const { pokemonName } = useParams(); // Access URL parameters using useParams
  const navigate = useNavigate();
  const location = useLocation();

  // State variables to store relevant data
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [moves, setMoves] = useState([]);
  const [about, setAbout] = useState(""); 
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || {});


  // Fetch Pokemon details from the backend
  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${POKEMON_URL}/${pokemonName}`);
        setPokemonDetails(response.data);

        // Fetch Pokémon species and evolution data
        const speciesUrl = response.data.species.url;
        const speciesResponse = await axios.get(speciesUrl);
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);
        setEvolutionChain(parseEvolutionChain(evolutionChainResponse.data));

        // Fetch the first 4 Pokémon moves
        const movesUrl = response.data.moves.slice(0, 4).map(move => move.move.name);
        setMoves(movesUrl);

        // Fetch Pokémon description from species data
        const speciesDescription = await axios.get(speciesUrl);
        const flavorTextEntries = speciesDescription.data.flavor_text_entries.filter(entry => entry.language.name === "en");
        if (flavorTextEntries.length > 0) {
          const cleanDescription = flavorTextEntries[0].flavor_text.replace(/\f/g, " ");
          setAbout(cleanDescription);
        }

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
    while (currentStage) {
      stages.push({
        name: currentStage.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentStage.species.url.split("/")[6]}.png`,
      });
      currentStage = currentStage.evolves_to[0];
    }
    return stages;
  };

  const handleBack = () => {
    // Navigate back to Home with the last known page state
    navigate('/', { state: { page: location.state?.fromPage|| 1 } });
  };
  
  // Reverse value that corresponds with the passed down name (key)
  const toggleFavorite = () => {
    const newFavorites = {
      ...favorites,
      [pokemonName]: !favorites[pokemonName]
    };
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pokemonDetails) return <div>Pokemon details not found.</div>;

  const { name, sprites, stats, types, id } = pokemonDetails;

  const typeColors = {
    normal: "#A8A878", fighting: "#C03028", flying: "#A890F0", poison: "#A040A0",
    ground: "#E0C068", rock: "#B8A038", bug: "#A8B820", ghost: "#705898",
    steel: "#B8B8D0", fire: "#F08030", water: "#6890F0", grass: "#78C850",
    electric: "#F8D030", psychic: "#F85888", ice: "#98D8D8", dragon: "#7038F8",
    dark: "#705848", fairy: "#EE99AC",
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 pt-20">
        {/** Button used to return to previous pagination page**/}
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <div className="flex justify-center">
          {/* Display Pokemon's Name and Picture */}
          <Card sx={{ width: 400, borderRadius: 4, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", position: "relative"}}>
            {/** Favorite Heart Button **/}
            <Button
              onClick={toggleFavorite}
              sx={{ position: 'absolute', top: 8, left: 8 }}
            >
              {favorites[pokemonName] ? <Favorite color="error" /> : <FavoriteBorder />}
            </Button>
            <CardContent>
              {/* Display Pokemon's Name */}
              <Typography variant="h5" component="div" gutterBottom style={{textAlign: 'center'}}>
                {name.toUpperCase()}
              </Typography>
              {/* Display Pokemon's ID */}
              <Typography variant="body2" color="text.secondary" sx={{ position: "absolute", top: 0, right: 0, marginTop: '10px', marginRight: '10px'}}>
                #{id}
              </Typography>
              {/* Display Pokemon's Types */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                {types.map((type, index) => (
                  <Chip
                    key={index}
                    label={type.type.name}
                    sx={{ backgroundColor: typeColors[type.type.name], color: "white", marginRight: "5px", marginLeft: "5px", paddingRight: "10px", paddingLeft: "10px" }}
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
              <div className="mt-6 text-center">
                {/* Display Pokemon stats with visual bars */}
                <Grid container spacing={2}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="body2" color="text.secondary">{stat.stat.name}</Typography>
                      <LinearProgress variant="determinate" value={(stat.base_stat / 255) * 100} sx={{ height: 10, borderRadius: 5, backgroundColor: '#ddd', '& .MuiLinearProgress-bar': { backgroundColor: typeColors[types[0].type.name] }}}/>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Display Pokemon's About Section */}
        {about && (
          <Box sx={{ border: 1, borderColor: 'red', borderRadius: 4, padding: 2, marginTop: 4 }}>
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="text-center">
              <Typography variant="body1">{about}</Typography>
            </div>
          </Box>
        )}
        <div className="mt-8">
          {/* Display Pokemon's Evolutions */}
          <Box sx={{ border: 1, borderColor: 'red', borderRadius: 4, padding: 2, marginTop: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1.75rem', fontWeight: 'bold' }}>
              {name.toUpperCase()}'S Evolutions
            </Typography>
            <div className="flex justify-evenly">
              {evolutionChain.map((stage, index) => (
                <Card key={index} sx={{ width: 160, m: 1, boxShadow: "0px 2px 4px rgba(0,0,0,0.5)", borderRadius: 4}}>
                  <Link to={`/pokemon/${stage.name}`} style={{ textDecoration: 'none' }}>
                    <CardMedia
                      component="img"
                      image={stage.sprite}
                      alt={`Sprite of ${stage.name}`}
                      sx={{ height: 160, objectFit: 'contain', p: 1 }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        {stage.name}
                      </Typography>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </Box>
        </div>

        <div className="mt-8">
          {/* Display Pokemon's Moves */}
          <Box sx={{ border: 1, borderColor: 'red', borderRadius: 4, padding: 2, marginTop: 4 }}>
            <h2 className="text-2xl font-bold mb-4">Moves</h2>
            <div className="grid grid-cols-2 gap-4 px-8 py-8">
              {moves.map((move, index) => (
                <Button 
                  key={index} 
                  variant="contained" 
                  style={{ backgroundColor: '#C22E28', color: "white", borderRadius: "10px", fontWeight: "bold" }}
                >
                  {move}
                </Button>
              ))}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;