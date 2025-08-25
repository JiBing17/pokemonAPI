// SetGallery.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  CircularProgress,
  Button,
  Container,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Header from './Header';
import SetDetailsDrawer from './SetDetailsDrawer';

const SETS_ENDPOINT = 'https://api.pokemontcg.io/v2/sets';
const SETS_PER_PAGE = 16;

export default function SetGallery() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeSetId, setActiveSetId] = useState(null);
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await axios.get(SETS_ENDPOINT);
        const sorted = res.data.data.sort((a, b) =>
          (b.releaseDate || '').localeCompare(a.releaseDate || '')
        );
        setSets(sorted);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  const filteredSets = sets.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedSets =
    search.trim() === ''
      ? filteredSets.slice((page - 1) * SETS_PER_PAGE, page * SETS_PER_PAGE)
      : filteredSets;

  const totalPages = Math.ceil(filteredSets.length / SETS_PER_PAGE);

  if (loading) {
    return (
      <Box mt={10} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={10} textAlign="center">
        <Typography color="error">Error loading sets.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container sx={{ mt: 12, pb: 6 }}>
        {/* Search Field */}
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search TCG sets..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {/* Sets Grid */}
        <Grid container spacing={4}>
          {paginatedSets.map((set) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={set.id}>
              <Card
                elevation={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 8,
                  },
                  bgcolor: 'background.paper',
                }}
              >
                {set.images?.logo && (
                  <Box
                    sx={{
                      bgcolor: 'background.default',
                      p: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={set.images.logo}
                      alt={set.name}
                      sx={{ height: 64, objectFit: 'contain' }}
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold', textAlign: 'center' }}
                  >
                    {set.name}
                  </Typography>

                  <Stack spacing={1} alignItems="center">
                    <Chip
                      label={set.series}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Released: {set.releaseDate || 'N/A'}
                    </Typography>
                  </Stack>

                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Cards:&nbsp;
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {set.total}
                      </Typography>
                    </Typography>
                    {set.printedTotal != null && (
                      <Typography variant="body2" color="text.secondary">
                        Printed Total:&nbsp;
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {set.printedTotal}
                        </Typography>
                      </Typography>
                    )}
                  </Box>

                  {set.ptcgoCode && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Code:&nbsp;
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {set.ptcgoCode}
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    // onClick={() => alert(`View details for ${set.name}`)}
                    onClick={() => { setActiveSetId(set.id); setDetailsOpen(true); }}
                    sx={{ textTransform: 'none' }}
                  >
                    View Set Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pagination Arrows (fixed middle left & right) */}
      {search.trim() === '' && totalPages > 1 && (
        <>
          <IconButton
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            sx={{
              position: 'fixed',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'primary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'rgba(25,118,210,0.5)' },
              zIndex: 1000,
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>

          <IconButton
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            sx={{
              position: 'fixed',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              bgcolor: 'primary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'rgba(25,118,210,0.5)' },
              zIndex: 1000,
            }}
          >
            <NavigateNextIcon />
          </IconButton>
            <SetDetailsDrawer    
              open={detailsOpen}
              onClose={() => setDetailsOpen(false)}    
              setId={activeSetId}
           />
        </>
      )}
    </>
  );
}
