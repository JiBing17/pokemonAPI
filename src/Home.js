import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Box,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite,
  FavoriteBorder,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
// API constants
const BASE_URL = 'http://localhost:5000/api';
const POKEMON_URL = `${BASE_URL}/pokemon`;
const PLACEHOLDER =
  'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif';

// Helpers
const getIdFromUrl = (url) => url.split('/').filter(Boolean).pop();
const getSpriteUrl = (url) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getIdFromUrl(
    url
  )}.png`;
const getGeneration = (pokedexId) => {
  const id = Number(pokedexId);
  if (id >= 1 && id <= 151) return 1;
  if (id >= 152 && id <= 251) return 2;
  if (id >= 252 && id <= 386) return 3;
  if (id >= 387 && id <= 493) return 4;
  if (id >= 494 && id <= 649) return 5;
  if (id >= 650 && id <= 721) return 6;
  if (id >= 722 && id <= 809) return 7;
  if (id >= 810 && id <= 898) return 8;
  if (id >= 899 && id <= 1010) return 9;
  return 0;
};

// Generation options and their first Pokédex IDs
const ALL_GEN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const FIRST_ID_BY_GEN = {
  1: 1,
  2: 152,
  3: 252,
  4: 387,
  5: 494,
  6: 650,
  7: 722,
  8: 810,
  9: 899,
};

export default function Home() {
  const navigate = useNavigate();
  const [allPokemonList, setAllPokemonList] = useState([]); // name + url for all ~1118
  const [pokemonData, setPokemonData] = useState([]); // paginated results for current page
  const [enrichedPagePokemon, setEnrichedPagePokemon] = useState([]); // enriched for current page
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites')) || {}
  );

  const [selectedGen, setSelectedGen] = useState('all'); // 'all', 1–9, or 'fav'
  const [searchQuery, setSearchQuery] = useState('');

  // 1) Fetch all Pokémon names+URLs once, for universal search
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${POKEMON_URL}?limit=2000`);
        setAllPokemonList(res.data.results);
      } catch (err) {
        console.error('Error fetching full Pokémon list:', err);
      }
    };
    fetchAll();
  }, []);

  // 2) Fetch paginated Pokémon (48 per page)
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${POKEMON_URL}?page=${currentPage}&limit=48`);
        const results = res.data.results;
        setPokemonData(results);
        setTotalPages(Math.ceil(res.data.count / 48));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [currentPage]);

  // 3) Enrich current page Pokémon with id, generation, spriteUrl
  useEffect(() => {
    const enriched = pokemonData.map((p) => {
      const id = getIdFromUrl(p.url);
      const gen = getGeneration(id);
      return {
        name: p.name,
        url: p.url,
        id: Number(id),
        generation: gen,
        spriteUrl: getSpriteUrl(p.url),
      };
    });
    setEnrichedPagePokemon(enriched);
  }, [pokemonData]);

  // 4) Build enrichedSearchResults when searchQuery changes
  const enrichedSearchResults = useMemo(() => {
    if (searchQuery.trim() === '') return [];
    const lower = searchQuery.toLowerCase();
    // Filter allPokemonList by name substring
    const matches = allPokemonList.filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
    // Map each match to enriched object (id/generation/sprite)
    return matches.map((p) => {
      const id = getIdFromUrl(p.url);
      const gen = getGeneration(id);
      return {
        name: p.name,
        url: p.url,
        id: Number(id),
        generation: gen,
        spriteUrl: getSpriteUrl(p.url),
      };
    });
  }, [searchQuery, allPokemonList]);

  // 5) Decide which list to display:
  //    - If searchQuery non-empty: use enrichedSearchResults
  //    - Else: take enrichedPagePokemon and apply selectedGen/favorites filter
  const dataToDisplay = useMemo(() => {
    if (searchQuery.trim() !== '') {
      // 5a) If searching, filter by generation or favorites if needed
      let list = [...enrichedSearchResults];
      if (selectedGen === 'fav') {
        list = list.filter((p) => favorites[p.name]);
      } else if (selectedGen !== 'all') {
        list = list.filter((p) => p.generation === Number(selectedGen));
      }
      return list;
    } else {
      // 5b) Not searching: filter current page
      let list = [...enrichedPagePokemon];
      if (selectedGen === 'fav') {
        list = list.filter((p) => favorites[p.name]);
      } else if (selectedGen !== 'all') {
        list = list.filter((p) => p.generation === Number(selectedGen));
      }
      return list;
    }
  }, [
    searchQuery,
    enrichedSearchResults,
    enrichedPagePokemon,
    selectedGen,
    favorites,
  ]);

  const toggleFavorite = (name) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[name]) {
        delete updated[name];
      } else {
        updated[name] = true;
      }
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // 6) Handle generation click: jump to page if not searching
  const handleGenClick = (gen) => {
    if (searchQuery.trim() !== '') {
      // If searching, just set filter and stay on search results
      setSelectedGen(gen);
    } else {
      if (gen === 'all' || gen === 'fav') {
        setSelectedGen(gen);
      } else {
        const firstId = FIRST_ID_BY_GEN[gen];
        const targetPage = Math.ceil(firstId / 48);
        setSelectedGen(gen);
        setCurrentPage(targetPage);
      }
    }
  };

  // 7) Navigate to details page on card click
  const handleCardClick = (name) => {
    navigate(`/pokemon/${name}`, { state: { fromPage: currentPage } });
  };

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* AppBar with title and search */}
      <Header/>
      <Box sx={{ p: 2, bgcolor: 'background.paper', mt:10}}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search Pokémon"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Generation & Filter Chips */}
      <Box sx={{ p: 2, overflowX: 'auto', bgcolor: 'background.paper'}}>
        <Stack direction="row" spacing={1}>
          <Chip
            label="All"
            clickable
            color={selectedGen === 'all' ? 'primary' : 'default'}
            onClick={() => handleGenClick('all')}
          />
          <Chip
            label="Favorites"
            clickable
            color={selectedGen === 'fav' ? 'primary' : 'default'}
            icon={<Favorite />}
            onClick={() => handleGenClick('fav')}
          />
          {ALL_GEN_OPTIONS.map((gen) => (
            <Chip
              key={gen}
              label={`Gen ${gen}`}
              clickable
              color={selectedGen === gen ? 'primary' : 'default'}
              onClick={() => handleGenClick(gen)}
            />
          ))}
        </Stack>
      </Box>

      {/* Display loading, empty, or grid */}
      <Box sx={{ p: 2, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : dataToDisplay.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary">
            {selectedGen === 'fav'
              ? 'No favorites match.'
              : 'No Pokémon match your criteria.'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {dataToDisplay.map((p) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={p.name}>
                <Card
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleCardClick(p.name)}
                >
                  {/* Favorite Icon */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(p.name);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 1,
                      color: favorites[p.name] ? 'red' : 'rgba(0,0,0,0.4)',
                    }}
                  >
                    {favorites[p.name] ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>

                  {/* Image */}
                  <CardMedia
                    component="img"
                    src={p.spriteUrl}
                    alt={p.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER;
                    }}
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'contain',
                      bgcolor: 'rgba(0,0,0,0.05)',
                    }}
                  />

                  {/* Name & Number */}
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    >
                      {p.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      #{p.id.toString().padStart(3, '0')}
                    </Typography>
                    <Chip
                      label={`Gen ${p.generation}`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Pagination Arrows (hidden during search) */}
        {!searchQuery.trim() && (
          <>
            {/* Left Arrow */}
            <IconButton
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                setSearchQuery('');
              }}
              disabled={currentPage === 1}
              sx={{
                position: 'fixed',
                top: '50%',
                left: 8,
                transform: 'translateY(-50%)',
                backgroundColor: '#C22E28',
                color: 'white',
                '&:hover': { backgroundColor: '#B22222' },
                '&:disabled': {
                  backgroundColor: 'rgba(194,46,40,0.5)',
                },
                zIndex: 1000,
              }}
            >
              <NavigateBefore />
            </IconButton>

            {/* Right Arrow */}
            <IconButton
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                setSearchQuery('');
              }}
              disabled={currentPage === totalPages}
              sx={{
                position: 'fixed',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                backgroundColor: '#C22E28',
                color: 'white',
                '&:hover': { backgroundColor: '#B22222' },
                '&:disabled': {
                  backgroundColor: 'rgba(194,46,40,0.5)',
                },
                zIndex: 1000,
              }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}
      </Box>

      {/* Page Indicator (hidden during search) */}
      {!searchQuery.trim() && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2">
            Page {currentPage} / {totalPages}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
