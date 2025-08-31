import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import Header from './Header';
import { useTheme, alpha } from '@mui/material/styles';
import { useMediaQuery, Stack, Tooltip } from '@mui/material';
import Zoom from '@mui/material/Zoom';

// PokéTCG API endpoints
const POKETCG_BASE = 'https://api.pokemontcg.io/v2';
const CARDS_ENDPOINT = `${POKETCG_BASE}/cards`;
const SETS_ENDPOINT = `${POKETCG_BASE}/sets`;

// Static list of Pokémon types
const TYPE_OPTIONS = [
  'Colorless',
  'Darkness',
  'Dragon',
  'Fairy',
  'Fighting',
  'Fire',
  'Grass',
  'Lightning',
  'Metal',
  'Psychic',
  'Water',
];

export default function CardBrowser() {
  const [setsList, setSetsList] = useState([]);            // All sets for dropdown
  const [cards, setCards] = useState([]);                  // Current-page cards
  const [expensiveCards, setExpensiveCards] = useState([]);// All matching cards sorted by price
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');      // Name search
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState('all');   // Set filter
  const [selectedType, setSelectedType] = useState('all'); // Type filter

  const [currentPage, setCurrentPage] = useState(1);       // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 48;

  const [showingExpensive, setShowingExpensive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null);

  const HEADER_HEIGHT = 64;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));


  // Debounce search so API isn’t called on every keystroke
  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Fetch all sets on mount
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await axios.get(SETS_ENDPOINT);
        setSetsList(res.data.data);
      } catch (err) {
        console.error('Error fetching sets:', err);
      }
    };
    fetchSets();
  }, []);

  // If set is reset to 'all', disable expensive feature
  useEffect(() => {
    if (selectedSet === 'all' && showingExpensive) {
      setShowingExpensive(false);
    }
  }, [selectedSet]);

  // Reset to page 1 whenever filters or toggle change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedSet, selectedType, showingExpensive]);

  // Helper: Build Lucene query string with wildcards
  const buildQuery = () => {
    const filters = [];
    if (debouncedQuery !== '') {
      const q = debouncedQuery.replace(/"/g, '');
      filters.push(`name:*${q}*`);
    }
    if (selectedSet !== 'all') {
      filters.push(`set.id:${selectedSet}`);
    }
    if (selectedType !== 'all') {
      filters.push(`types:${selectedType}`);
    }
    return filters.join(' ');
  };

  // Fetch either current-page cards or ALL matching cards for expensive view
  useEffect(() => {
    const fetchCurrentPage = async () => {
      setIsLoading(true);
      setError(null);
      const qParam = buildQuery();

      try {
        const res = await axios.get(CARDS_ENDPOINT, {
          params: {
            q: qParam,
            page: currentPage,
            pageSize: PAGE_SIZE,
          },
        });
        setCards(res.data.data);
        const totalCount = res.data.totalCount || 0;
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAllAndSort = async () => {
      setIsLoading(true);
      setError(null);
      const qParam = buildQuery();
      let all = [];
      let page = 1;
      try {
        while (true) {
          const res = await axios.get(CARDS_ENDPOINT, {
            params: {
              q: qParam,
              page,
              pageSize: 250, // max allowed
            },
          });
          const data = res.data.data;
          all = all.concat(data);
          const totalCount = res.data.totalCount || 0;
          const fetched = page * 250;
          if (fetched >= totalCount) break;
          page += 1;
        }
        // Sort by highest market price
        const sorted = all
          .filter(
            (card) =>
              card.tcgplayer?.prices?.holofoil?.market ||
              card.tcgplayer?.prices?.normal?.market
          )
          .sort((a, b) => {
            const aPrice =
              a.tcgplayer?.prices?.holofoil?.market ||
              a.tcgplayer?.prices?.normal?.market ||
              0;
            const bPrice =
              b.tcgplayer?.prices?.holofoil?.market ||
              b.tcgplayer?.prices?.normal?.market ||
              0;
            return bPrice - aPrice;
          });
        setExpensiveCards(sorted);
        setTotalPages(Math.ceil(sorted.length / PAGE_SIZE));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (showingExpensive) {
      fetchAllAndSort();
    } else {
      setExpensiveCards([]);
      fetchCurrentPage();
    }
  }, [
    debouncedQuery,
    selectedSet,
    selectedType,
    currentPage,
    showingExpensive,
  ]);

  // Determine which set of cards to display (sorted or paginated)
  const displayedCards = useMemo(() => {
    if (showingExpensive) {
      const start = (currentPage - 1) * PAGE_SIZE;
      return expensiveCards.slice(start, start + PAGE_SIZE);
    }
    return cards;
  }, [cards, expensiveCards, showingExpensive, currentPage]);

  const openModal = (card) => {
    setModalCard(card);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalCard(null);
  };

  return (
    <Box>
      {/* ====== HEADER ====== */}
      <Header />

      {/* ====== FILTER BAR (sticky) ====== */}
      <Paper
        elevation={2}
        sx={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 100,
          p: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        {/* Search Bar */}
        <TextField
          sx={{ flexGrow: 1, minWidth: 240 }}
          variant="outlined"
          size="small"
          placeholder="Search by name"
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

        {/* Set Selector */}
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Set</InputLabel>
          <Select
            value={selectedSet}
            label="Set"
            onChange={(e) => setSelectedSet(e.target.value)}
          >
            <MenuItem value="all">All Sets</MenuItem>
            {setsList.map((set) => (
              <MenuItem key={set.id} value={set.id}>
                {set.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type Selector */}
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            {TYPE_OPTIONS.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Most Expensive Toggle (disabled when Set = All) */}
        <Chip
          label="Top Valued"
          clickable={!showingExpensive && selectedSet !== 'all'}
          color={showingExpensive ? 'primary' : 'default'}
          onClick={() => {
            if (selectedSet !== 'all') {
              setShowingExpensive((prev) => !prev);
            }
          }}
          disabled={selectedSet === 'all'}
          sx={{ height: 32 }}
        />
      </Paper>

      {/* ====== CARD GRID ====== */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography color="error">Error loading cards.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayedCards.map((card) => {
              // Determine a market price if available
              const price =
                card.tcgplayer?.prices?.holofoil?.market ||
                card.tcgplayer?.prices?.normal?.market ||
                null;
              return (
                <Grid item xs={6} sm={4} md={3} lg={2} key={card.id}>
                  <Card
                    elevation={4}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%', // ensure uniform height
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: 8,
                      },
                    }}
                    onClick={() => openModal(card)}
                  >
                    {/* Card Image */}
                    <CardMedia
                      component="img"
                      src={card.images.small}
                      alt={card.name}
                      sx={{
                        width: '100%',
                        aspectRatio: '0.7',
                        objectFit: 'contain',
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                      }}
                    />

                    {/* Card Info */}
                    <CardContent
                      sx={{
                        textAlign: 'center',
                        py: 1,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                          }}
                          noWrap
                        >
                          {card.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                        {card.rarity && (
                          <Chip
                            label={card.rarity}
                            size="small"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        )}
                        {price && (
                          <Chip
                            label={`$${price.toFixed(2)}`}
                            size="small"
                            color="success"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

    {/* ====== PAGINATION (middle-left & middle-right) ====== */}
    {!isLoading && !error && displayedCards.length > 0 && (
      <>
        <IconButton
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          sx={{
            position: 'fixed',
            top: '50%',
            left: 16,
            transform: 'translateY(-50%)',
            backgroundColor: '#c22e28',
            color: 'white',
            '&:hover': { backgroundColor: '#8b1f1c' },
            '&:disabled': { backgroundColor: 'rgba(194,46,40,0.5)' },
            zIndex: 1000,
          }}
        >
          <NavigateBefore />
        </IconButton>

        <IconButton
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          sx={{
            position: 'fixed',
            top: '50%',
            right: 16,
            transform: 'translateY(-50%)',
            backgroundColor: '#c22e28',
            color: 'white',
            '&:hover': { backgroundColor: '#8b1f1c' },
            '&:disabled': { backgroundColor: 'rgba(194,46,40,0.5)' },
            zIndex: 1000,
          }}
        >
      <NavigateNext />
    </IconButton>
  </>
)}

      {/* ====== PAGE INDICATOR ====== */}
      {!isLoading && !error && displayedCards.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            px: 3,
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

      {/* ====== CARD DETAIL DIALOG (restyled) ====== */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        TransitionComponent={Zoom}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(6px)',
              backgroundColor: (t) => alpha(t.palette.common.black, 0.5),
            },
          },
        }}
        PaperProps={{
          sx: {
            overflow: 'hidden',
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: 24,
            // very subtle paper gradient
            backgroundImage: (t) =>
              `linear-gradient(180deg, ${t.palette.background.paper} 0%, ${alpha(
                t.palette.background.paper,
                0.9
              )} 100%)`,
          },
        }}
      >
        {/* Title bar with soft gradient + close */}
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 3 },
            textAlign: 'center',
            color: 'primary.contrastText',
            fontWeight: 800,
            letterSpacing: 0.2,
            position: 'relative',
            background: `linear-gradient(135deg, #c22e28 0%, #8b1f1c 100%)`,
            // subtle shine
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0))',
              pointerEvents: 'none',
            },
          }}
        >
          {modalCard?.name}
          <Tooltip title="Close">
            <IconButton
              aria-label="close"
              onClick={closeModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'primary.contrastText',
                bgcolor: 'rgba(255,255,255,0.12)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        {/* Content: two-column, comfy spacing, scrollable on small screens */}
        <DialogContent
          dividers
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: 'transparent',
          }}
        >
          {modalCard && (
            <Grid container spacing={3} alignItems="flex-start">
              {/* LEFT: big image with floating badges */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    mx: 'auto',
                    width: { xs: 260, sm: 300 },
                    aspectRatio: '0.7',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 6,
                    bgcolor: 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Box
                    component="img"
                    src={modalCard.images.large}
                    alt={modalCard.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  {/* price + rarity chips float */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  >
                    {modalCard.rarity && (
                      <Chip
                        size="small"
                        label={modalCard.rarity}
                        sx={{
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          fontWeight: 600,
                          height: 24,
                        }}
                      />
                    )}
                    {(() => {
                      const price =
                        modalCard.tcgplayer?.prices?.holofoil?.market ??
                        modalCard.tcgplayer?.prices?.normal?.market ??
                        null;
                      return (
                        price && (
                          <Chip
                            size="small"
                            color="success"
                            label={`$${price.toFixed(2)}`}
                            sx={{ boxShadow: 2, height: 24, fontWeight: 700 }}
                          />
                        )
                      );
                    })()}
                  </Stack>
                </Box>
              </Grid>

              {/* RIGHT: details */}
              <Grid item xs={12} md={7}>
                <Stack spacing={1.25}>
                  <Typography variant="overline" color="text.secondary">
                    Overview
                  </Typography>

                  <Stack spacing={0.5}>
                    <Typography variant="body1">
                      <strong>Set:</strong> {modalCard.set.name} ({modalCard.set.series})
                    </Typography>
                    <Typography variant="body1">
                      <strong>Supertype:</strong> {modalCard.supertype}
                    </Typography>
                    {!!modalCard.subtypes?.length && (
                      <Typography variant="body1">
                        <strong>Subtype:</strong> {modalCard.subtypes.join(', ')}
                      </Typography>
                    )}
                    {!!modalCard.hp && (
                      <Typography variant="body1">
                        <strong>HP:</strong> {modalCard.hp}
                      </Typography>
                    )}

                    {!!modalCard.types?.length && (
                      <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: 'wrap' }}>
                        {modalCard.types.map((type) => (
                          <Chip
                            key={type}
                            label={type}
                            color="secondary"
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.75rem' }}
                          />
                        ))}
                      </Stack>
                    )}

                    {!!modalCard.flavorText && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          mt: 1,
                          p: 1.25,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                          border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.25)}`,
                          borderRadius: 1.5,
                        }}
                      >
                        “{modalCard.flavorText}”
                      </Typography>
                    )}
                  </Stack>

                  {/* Attacks */}
                  {!!modalCard.attacks?.length && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="overline" color="text.secondary">
                        Attacks
                      </Typography>
                      <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                        {modalCard.attacks.map((atk, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{ p: 1.25, borderRadius: 1.5 }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {atk.name}{' '}
                              {atk.damage && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  — {atk.damage}
                                </Typography>
                              )}
                            </Typography>
                            {!!atk.text && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {atk.text}
                              </Typography>
                            )}
                            {!!atk.cost?.length && (
                              <Typography variant="caption" color="text.secondary">
                                Cost: {atk.cost.join(', ')}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Abilities */}
                  {!!modalCard.abilities?.length && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="overline" color="text.secondary">
                        Abilities
                      </Typography>
                      <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                        {modalCard.abilities.map((ab, idx) => (
                          <Paper key={idx} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {ab.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {ab.text}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Weak/Resist/Retreat */}
                  {(modalCard.weaknesses || modalCard.resistances || modalCard.retreatCost) && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.25, borderRadius: 1.5, mt: 1 }}
                    >
                      <Stack spacing={0.5}>
                        {!!modalCard.weaknesses && (
                          <Typography variant="body2">
                            <strong>Weaknesses:</strong>{' '}
                            {modalCard.weaknesses.map((w) => `${w.type} ×${w.value}`).join(', ')}
                          </Typography>
                        )}
                        {!!modalCard.resistances && (
                          <Typography variant="body2">
                            <strong>Resistances:</strong>{' '}
                            {modalCard.resistances.map((r) => `${r.type} ×${r.value}`).join(', ')}
                          </Typography>
                        )}
                        {!!modalCard.retreatCost?.length && (
                          <Typography variant="body2">
                            <strong>Retreat Cost:</strong> {modalCard.retreatCost.join(', ')}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {/* Sticky actions with glass effect */}
        <DialogActions
          sx={{
            position: { xs: 'static', md: 'sticky' },
            bottom: 0,
            zIndex: 1,
            p: { xs: 2, sm: 2.5 },
            justifyContent: 'center',
            background: (t) =>
              `linear-gradient(180deg, ${alpha(t.palette.background.paper, 0.6)} 0%, ${t.palette.background.paper} 60%)`,
            backdropFilter: 'blur(6px)',
            borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.8)}`,
          }}
        >
          <Button
            onClick={closeModal}
            variant="contained"
            size="large"
            sx={{ bgcolor: '#c22e28', '&:hover': { bgcolor: '#8b1f1c' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
