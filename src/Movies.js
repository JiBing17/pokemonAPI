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
  Chip
} from '@mui/material';
import Header from './Header';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const first = await axios.get(
          `${TMDB_BASE_URL}/search/movie`,
          { params: {
              api_key: TMDB_API_KEY,
              query: 'Pokémon',
              include_adult: false,
              page: 1
          }}
        );
        const pages = first.data.total_pages;
        let all = [...first.data.results];
        const calls = [];
        for (let i = 2; i <= pages; i++) {
          calls.push(
            axios.get(`${TMDB_BASE_URL}/search/movie`, {
              params: { api_key: TMDB_API_KEY, query: 'Pokémon', include_adult: false, page: i }
            })
          );
        }
        const responses = await Promise.all(calls);
        responses.forEach(r => all.push(...r.data.results));
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

  return (
    <>
      <Header/>
      <Container  className='pt-20'>
        <TextField
          variant="outlined"
          fullWidth
          label="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />
        {filteredMovies.length === 0 ? (
          <Typography variant="h6" align="center">
            No movies found.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredMovies.map((movie) => (
              <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
                    },
                  }}
                  elevation={3}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      image={
                        movie.poster_path
                          ? `${POSTER_BASE_URL}${movie.poster_path}`
                          : 'https://via.placeholder.com/500x750?text=No+Image'
                      }
                      alt={movie.title}
                      height="300"
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        noWrap
                      >
                        {movie.title}
                      </Typography>
                      <Chip
                        label={movie.release_date || 'N/A'}
                        size="small"
                        sx={{ mb: 1 }}
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
