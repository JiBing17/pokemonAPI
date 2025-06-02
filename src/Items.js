import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite,
  FavoriteBorder,
  NavigateBefore,
  NavigateNext,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
// PokeAPI constants
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const ITEMS_ENDPOINT = `${POKEAPI_BASE}/item`;
const PLACEHOLDER =
  'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif';

// Helper to extract ID from a full URL
const getIdFromUrl = url => parseInt(url.split('/').filter(Boolean).pop(), 10);

// Build the 64×64 sprite URL for an item
const getItemSpriteUrl = name =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;

export default function Items() {
  const navigate = useNavigate();

  // 1) Full items list (for universal search)
  const [allItemsList, setAllItemsList] = useState([]);

  // 2) Paginated items (name + url) and enriched page items
  const [pageItems, setPageItems] = useState([]);
  const [enrichedPageItems, setEnrichedPageItems] = useState([]);

  // 3) Loading & error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4) Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 48;

  // 5) Favorites in localStorage
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('itemFavorites')) || {}
  );

  // 6) Search query
  const [searchQuery, setSearchQuery] = useState('');

  // 7) Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  // Fetch “all items” once (for search)
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await axios.get(`${ITEMS_ENDPOINT}?limit=10000`);
        setAllItemsList(res.data.results);
      } catch (err) {
        console.error('Error fetching all items:', err);
      }
    };
    fetchAllItems();
  }, []);

  // Fetch paginated items whenever currentPage changes
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const res = await axios.get(
          `${ITEMS_ENDPOINT}?offset=${offset}&limit=${ITEMS_PER_PAGE}`
        );
        setPageItems(res.data.results);
        setTotalPages(Math.ceil(res.data.count / ITEMS_PER_PAGE));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [currentPage]);

  // Enrich current page’s items with details (cost, category, effect, sprite)
  useEffect(() => {
    const enrichPage = async () => {
      if (pageItems.length === 0) {
        setEnrichedPageItems([]);
        return;
      }
      setIsLoading(true);
      const promises = pageItems.map(async item => {
        try {
          const res = await axios.get(item.url);
          const data = res.data;
          return {
            name: data.name,
            id: data.id,
            cost: data.cost,
            category: data.category.name,
            effect: data.effect_entries.find(e => e.language.name === 'en')
              ?.short_effect,
            spriteUrl: getItemSpriteUrl(data.name),
          };
        } catch {
          return {
            name: item.name,
            id: getIdFromUrl(item.url),
            cost: null,
            category: 'unknown',
            effect: '',
            spriteUrl: PLACEHOLDER,
          };
        }
      });

      try {
        const results = await Promise.all(promises);
        setEnrichedPageItems(results);
      } catch {
        setEnrichedPageItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    enrichPage();
  }, [pageItems]);

  // Build enriched search results whenever searchQuery changes
  const enrichedSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === '') return [];
    const matches = allItemsList.filter(item =>
      item.name.toLowerCase().includes(q)
    );
    return matches.map(item => {
      const id = getIdFromUrl(item.url);
      return {
        name: item.name,
        id,
        cost: null,
        category: null,
        effect: null,
        spriteUrl: getItemSpriteUrl(item.name),
      };
    });
  }, [searchQuery, allItemsList]);

  // Decide what data to display: search or page
  const dataToDisplay = useMemo(() => {
    if (searchQuery.trim() !== '') {
      return enrichedSearchResults;
    }
    return enrichedPageItems;
  }, [searchQuery, enrichedSearchResults, enrichedPageItems]);

  // Toggle favorite
  const toggleFavorite = name => {
    setFavorites(prev => {
      const updated = { ...prev };
      if (updated[name]) {
        delete updated[name];
      } else {
        updated[name] = true;
      }
      localStorage.setItem('itemFavorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Open detail dialog
  const openModal = async item => {
    if (item.cost !== null || item.category !== null) {
      setModalItem(item);
      setModalOpen(true);
      return;
    }
    try {
      const res = await axios.get(`${POKEAPI_BASE}/item/${item.name}`);
      const data = res.data;
      setModalItem({
        name: data.name,
        id: data.id,
        cost: data.cost,
        category: data.category.name,
        effect: data.effect_entries.find(e => e.language.name === 'en')
          ?.short_effect,
        spriteUrl: getItemSpriteUrl(data.name),
      });
      setModalOpen(true);
    } catch {
      setModalItem({ ...item, effect: '', cost: null, category: null });
      setModalOpen(true);
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  // Handle card click: navigate if searching, otherwise open dialog
  const handleCardClick = item => {
    if (searchQuery.trim() !== '') {
      navigate(`/item/${item.name}`);
    } else {
      openModal(item);
    }
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
      <Header/>
      {/* Search Bar (outside header) */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', mt: 10 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search Items"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 2, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : dataToDisplay.length === 0 ? (
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            {searchQuery.trim() !== ''
              ? 'No items match your search.'
              : 'No items to display on this page.'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {dataToDisplay.map(item => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item.name}>
                <Card
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  {/* Favorite Heart */}
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(item.name);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 1,
                      color: favorites[item.name]
                        ? 'red'
                        : 'rgba(0,0,0,0.4)',
                    }}
                  >
                    {favorites[item.name] ? (
                      <Favorite />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>

                  {/* Item Sprite */}
                  <CardMedia
                    component="img"
                    src={item.spriteUrl}
                    alt={item.name}
                    loading="lazy"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER;
                    }}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mt: 1,
                      imageRendering: 'pixelated',
                      objectFit: 'contain',
                      bgcolor: 'rgba(0,0,0,0.03)',
                    }}
                  />

                  {/* Name and Cost */}
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    >
                      {item.name}
                    </Typography>
                    {searchQuery.trim() === '' && item.cost !== null && (
                      <Typography variant="caption" color="text.secondary">
                        Cost: {item.cost}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Pagination Arrows */}
        {!searchQuery.trim() && (
          <>
            <IconButton
              onClick={() => {
                setCurrentPage(p => Math.max(p - 1, 1));
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
                '&:disabled': { backgroundColor: 'rgba(194,46,40,0.5)' },
                zIndex: 1000,
              }}
            >
              <NavigateBefore />
            </IconButton>

            <IconButton
              onClick={() => {
                setCurrentPage(p => Math.min(p + 1, totalPages));
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
                '&:disabled': { backgroundColor: 'rgba(194,46,40,0.5)' },
                zIndex: 1000,
              }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}
      </Box>

      {/* Page Indicator */}
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

      {/* Item Detail Dialog (Image Centered Vertically) */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            bgcolor: '#C22E28',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {modalItem?.name?.toUpperCase()}
          <IconButton
            aria-label="close"
            onClick={closeModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default',
            minHeight: 320,
          }}
        >
          {modalItem && (
            <>
              {/* Circular Image with shadow, centered vertically */}
              <Box
                component="img"
                src={modalItem.spriteUrl}
                alt={modalItem.name}
                sx={{
                  width: 150,
                  height: 150,
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  border: '4px solid white',
                  borderRadius: '50%',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                  bgcolor: 'white',
                  mb: 2,
                }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER;
                }}
              />

              {/* ID, Cost & Category in a horizontal stack */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                {modalItem.id !== null && (
                  <Chip
                    label={`#${modalItem.id.toString().padStart(3, '0')}`}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {modalItem.cost !== null && (
                  <Chip
                    label={`Cost: ${modalItem.cost}`}
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {modalItem.category && (
                  <Chip
                    label={modalItem.category.replace(/-/g, ' ')}
                    variant="outlined"
                    sx={{ fontStyle: 'italic' }}
                  />
                )}
              </Box>

              <Box sx={{ width: '100%' }}>
                <Divider sx={{ mb: 2 }} />
                {/* Effect section */}
                {modalItem.effect && (
                  <Box
                    sx={{
                      textAlign: 'left',
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      p: 2,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      Effect
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {modalItem.effect}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            onClick={closeModal}
            variant="contained"
            sx={{
              backgroundColor: '#C22E28',
              color: 'white',
              borderRadius: 2,
              px: 4,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
