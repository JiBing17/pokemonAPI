import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  TextField,
  CircularProgress,
  Box,
  Chip,
  Rating,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import placeHolder from './static/placeholder.jpg';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [durations, setDurations] = useState({});
  const navigate = useNavigate();

  // 1) Fetch genre list ONCE
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US' },
        });
        const map = {};
        res.data.genres.forEach((g) => {
          map[g.id] = g.name;
        });
        setGenreMap(map);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // 2) Fetch all Pokémon movies (possibly multiple pages)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const first = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            query: 'Pokémon',
            include_adult: false,
            page: 1,
          },
        });
        const pages = first.data.total_pages;
        let all = [...first.data.results];

        // Fetch remaining pages in parallel
        const calls = [];
        for (let i = 2; i <= pages; i++) {
          calls.push(
            axios.get(`${TMDB_BASE_URL}/search/movie`, {
              params: {
                api_key: TMDB_API_KEY,
                query: 'Pokémon',
                include_adult: false,
                page: i,
              },
            })
          );
        }
        const responses = await Promise.all(calls);
        responses.forEach((r) => all.push(...r.data.results));

        setMovies(all);
        setFilteredMovies(all);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 3) Once `movies` is set, fetch every movie’s runtime exactly ONCE
  useEffect(() => {
    if (movies.length === 0) return;
    const fetchAllRuntimes = async () => {
      const newDurations = {};
      await Promise.all(
        movies.map(async (m) => {
          try {
            const detailRes = await axios.get(
              `${TMDB_BASE_URL}/movie/${m.id}`,
              {
                params: { api_key: TMDB_API_KEY },
              }
            );
            newDurations[m.id] = detailRes.data.runtime;
          } catch (_) {
            // swallow 404 or other errors for individual movies
          }
        })
      );
      setDurations(newDurations);
    };
    fetchAllRuntimes();
  }, [movies]);

  // 4) Filter based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(
        movies.filter((m) =>
          m.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, movies]);

  // Carousel nav
  const handlePrev = () => {
    setHeroIndex((prev) =>
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    );
  };
  const handleNext = () => {
    setHeroIndex((prev) =>
      prev === featuredMovies.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={8}>
        <Typography variant="h6" color="error" align="center">
          {`Error: ${error.message}`}
        </Typography>
      </Box>
    );
  }

  // Pick top 5 by popularity for the carousel
  const featuredMovies = [...movies]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);

  return (
    <>
      <Header />

      {/* ─── TAILWIND CAROUSEL │ HERO SECTION ───────────────────────────────── */}
      <div className="mt-12 w-full relative">
        {featuredMovies.length > 0 && (
          <div className="relative">
            {/* Background image */}
            <img
              src={
                featuredMovies[heroIndex].backdrop_path
                  ? `${BACKDROP_BASE_URL}${featuredMovies[heroIndex].backdrop_path}`
                  : featuredMovies[heroIndex].poster_path
                  ? `${POSTER_BASE_URL}${featuredMovies[heroIndex].poster_path}`
                  : 'https://via.placeholder.com/1920x1080?text=No+Image'
              }
              alt={featuredMovies[heroIndex].title}
              className="w-full h-[80vh] object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30" />

            {/* Text Container */}
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 max-w-md bg-black bg-opacity-50 p-6 rounded-lg text-white">
              <div className="mb-2">
                <span className="font-semibold">
                  ⭐ {featuredMovies[heroIndex].vote_average}
                </span>
                <span className="mx-2">|</span>
                {featuredMovies[heroIndex].genre_ids.map((gId, idx) => {
                  const name = genreMap[gId] || 'Unknown';
                  const isLast =
                    idx ===
                    featuredMovies[heroIndex].genre_ids.length - 1;
                  return (
                    <span key={gId}>
                      {name}
                      {!isLast && <span className="mx-1">|</span>}
                    </span>
                  );
                })}
              </div>
              <h1 className="text-3xl font-bold mb-3">
                {featuredMovies[heroIndex].title}
              </h1>
              <p className="text-sm mb-4 line-clamp-5">
                {featuredMovies[heroIndex].overview}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    window.open(
                      `https://www.themoviedb.org/movie/${featuredMovies[heroIndex].id}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Watch on TMDB
                </button>
                <button
                  onClick={() => {
                    /* implement add-to-list logic */
                  }}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md"
                >
                  Add to List
                </button>
              </div>
            </div>

            {/* Left Arrow */}
            <div
              onClick={handlePrev}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 text-white p-3 rounded-full bg-black bg-opacity-50 cursor-pointer"
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </div>

            {/* Right Arrow */}
            <div
              onClick={handleNext}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 text-white p-3 rounded-full bg-black bg-opacity-50 cursor-pointer"
            >
              <FontAwesomeIcon icon={faArrowRight} size="lg" />
            </div>
          </div>
        )}
      </div>

      {/* ─── SEARCH & MOVIE GRID ─────────────────────────────────────────────── */}
      <Container sx={{ pb: 8, mt: 4 }}>
        <TextField
          variant="outlined"
          fullWidth
          label="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: '40px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            },
            '& .MuiOutlinedInput-input': {
              padding: '12px 20px',
            },
            '& .MuiInputLabel-root': {
              color: '#3D7DCA',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3D7DCA',
            },
          }}
        />

        {filteredMovies.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary">
            No movies found.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredMovies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  onClick={() =>
                    navigate(`/movie/${movie.id}`, {
                      state: {
                        movie,
                        genres: genreMap,
                        durations,
                        key: TMDB_API_KEY,
                      },
                    })
                  }
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                    },
                    bgcolor: '#F5F5F5',
                  }}
                  elevation={2}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      image={
                        movie.poster_path
                          ? `${POSTER_BASE_URL}${movie.poster_path}`
                          : placeHolder
                      }
                      alt={movie.title}
                      sx={{
                        height: { xs: '250px', md: '300px' },
                        objectFit: 'cover',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        noWrap
                        sx={{ fontWeight: 600, color: '#333' }}
                      >
                        {movie.title}
                      </Typography>

                      {/* ★★★★★ Star Rating (read-only) */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Rating
                          name={`rating-${movie.id}`}
                          value={movie.vote_average / 2}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          {Number(movie.vote_average).toFixed(1)}
                        </Typography>
                      </Box>

                      <Chip
                        label={movie.release_date || 'N/A'}
                        size="small"
                        sx={{
                          mb: 1,
                          bgcolor: '#3D7DCA',
                          color: '#fff',
                          fontWeight: 500,
                        }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        {movie.overview.length > 120
                          ? `${movie.overview.slice(0, 120)}…`
                          : movie.overview}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
