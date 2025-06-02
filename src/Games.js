import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  TextField,
  CircularProgress,
  Box,
  Chip,
  Skeleton
} from '@mui/material';
import Header from './Header';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const PLACEHOLDER_ICON = 'https://via.placeholder.com/300x200?text=Game';

function getIdFromUrl(url) {
  return url.split('/').filter(Boolean).pop();
}

function humanizeName(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function GameCard({ game }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageUrl = PLACEHOLDER_ICON;

  return (
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
        <Box position="relative">
          {!loaded && (
            <Skeleton variant="rectangular" width="100%" height={140} animation="wave" />
          )}
          <CardMedia
            component="img"
            image={error ? PLACEHOLDER_ICON : imageUrl}
            alt={humanizeName(game.name)}
            height="140"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              setError(true);
              setLoaded(true);
            }}
            sx={{
              display: loaded ? 'block' : 'none',
              width: '100%'
            }}
          />
        </Box>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {humanizeName(game.name)}
          </Typography>
          <Chip label={`ID: ${getIdFromUrl(game.url)}`} size="small" sx={{ mb: 1 }} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Games() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await axios.get(`${POKEAPI_BASE}/version-group?limit=50`);
        setGames(data.results);
        setFilteredGames(data.results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredGames(games);
    } else {
      setFilteredGames(
        games.filter(g =>
          g.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, games]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={8}>
      <CircularProgress />
    </Box>
  );
  if (error) return (
    <Box mt={8}>
      <Typography variant="h6" color="error" align="center">
        {`Error: ${error.message}`}
      </Typography>
    </Box>
  );

  return (
    <>
      <Header/>
      <Container sx={{ pt: 20, pb: 4 }}>
        <TextField
          variant="outlined"
          fullWidth
          label="Search games..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />
        {filteredGames.length === 0 ? (
          <Typography variant="h6" align="center">
            No games found.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredGames.map(game => (
              <Grid item key={getIdFromUrl(game.url)} xs={12} sm={6} md={4} lg={3}>
                <GameCard game={game} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}
