// SetDetailsDrawer.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Drawer,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const API_BASE = 'https://api.pokemontcg.io/v2';
const PAGE_SIZE = 24;

export default function SetDetailsDrawer({ open, onClose, setId }) {
  const [setInfo, setSetInfo] = useState(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [setErr, setSetErr] = useState(null);

  const [cards, setCards] = useState([]);
  const [cardsErr, setCardsErr] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Optional: if you have a key, uncomment:
  const axiosCfg = useMemo(
    () => ({
      // headers: { 'X-Api-Key': import.meta.env.VITE_POKEMONTCG_API_KEY },
    }),
    []
  );

  // Reset pagination when setId changes
  useEffect(() => setPage(1), [setId]);

  // Fetch set info
  useEffect(() => {
    if (!open || !setId) return;
    let cancelled = false;
    setLoadingSet(true);
    setSetErr(null);

    axios
      .get(`${API_BASE}/sets/${setId}`, axiosCfg)
      .then((res) => !cancelled && setSetInfo(res.data?.data ?? null))
      .catch((err) => !cancelled && setSetErr(err))
      .finally(() => !cancelled && setLoadingSet(false));

    return () => { cancelled = true; };
  }, [open, setId, axiosCfg]);

  // Fetch cards with server-side pagination
  useEffect(() => {
    if (!open || !setId) return;
    let cancelled = false;
    setLoadingCards(true);
    setCardsErr(null);

    const params = new URLSearchParams({
      q: `set.id:${setId}`,
      orderBy: 'number',
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });

    axios
      .get(`${API_BASE}/cards?${params.toString()}`, axiosCfg)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data;
        setCards(payload?.data ?? []);
        setTotalCount(payload?.totalCount ?? payload?.total ?? 0);
      })
      .catch((err) => !cancelled && setCardsErr(err))
      .finally(() => !cancelled && setLoadingCards(false));

    return () => { cancelled = true; };
  }, [open, setId, page, axiosCfg]);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: 900 } } }}>
      <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {setInfo?.name || (setId ? `Set: ${setId}` : 'Set Details')}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </Box>

      {/* Set header */}
      <Box sx={{ px: 2, pb: 2 }}>
        {loadingSet ? (
          <Box mt={4} textAlign="center"><CircularProgress /></Box>
        ) : setErr ? (
          <Typography color="error" sx={{ mt: 2 }}>Couldn’t load set: {String(setErr?.message || 'Unknown error')}</Typography>
        ) : setInfo ? (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {setInfo?.images?.logo && (
                <CardMedia component="img" src={setInfo.images.logo} alt={`${setInfo.name} logo`} sx={{ height: 48, width: 160, objectFit: 'contain' }} />
              )}
              {setInfo?.images?.symbol && (
                <CardMedia component="img" src={setInfo.images.symbol} alt={`${setInfo.name} symbol`} sx={{ height: 32, width: 32, objectFit: 'contain' }} />
              )}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={setInfo.series} color="primary" sx={{ color: '#fff' }} />
              {setInfo.releaseDate && <Chip label={`Released: ${setInfo.releaseDate}`} />}
              {setInfo.ptcgoCode && <Chip label={`PTCGO: ${setInfo.ptcgoCode}`} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Total: <b>{setInfo.total}</b>
              {setInfo.printedTotal != null ? <> • Printed: <b>{setInfo.printedTotal}</b></> : null}
            </Typography>
          </Stack>
        ) : null}
        <Divider />
      </Box>

      {/* Cards grid */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Cards {totalCount ? `(${totalCount})` : ''}
        </Typography>

        {loadingCards ? (
          <Box mt={4} textAlign="center"><CircularProgress /></Box>
        ) : cardsErr ? (
          <Typography color="error" sx={{ mt: 2 }}>Couldn’t load cards: {String(cardsErr?.message || 'Unknown error')}</Typography>
        ) : cards.length === 0 ? (
          <Typography color="text.secondary">No cards found in this set.</Typography>
        ) : (
          <Grid container spacing={2}>
            {cards.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                  <CardActionArea
                    onClick={() =>
                      window.open(
                        c.tcgplayer?.url ||
                        c.cardmarket?.url ||
                        `https://api.pokemontcg.io/v2/cards/${c.id}`,
                        '_blank'
                      )
                    }
                    sx={{ height: '100%' }}
                  >
                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240, bgcolor: 'background.default' }}>
                      <CardMedia
                        component="img"
                        src={c.images?.small}
                        alt={c.name}
                        sx={{ maxHeight: 240, objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                    </Box>
                    <CardContent>
                      <Tooltip title={c.name}><Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{c.name}</Typography></Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        #{c.number}{c.rarity ? ` • ${c.rarity}` : ''}
                      </Typography>
                      {Array.isArray(c.types) && c.types.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                          {c.types.map((t) => <Chip key={t} label={t} size="small" />)}
                        </Stack>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ my: 2 }}>
            <IconButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="body2">Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}</Typography>
            <IconButton
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
