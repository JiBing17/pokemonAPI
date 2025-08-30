import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { Visibility, VisibilityOff, Shield, Bolt } from "@mui/icons-material";

/**
 * CREATE ACCOUNT — PokéWorld
 * - Form on the LEFT (wide, breathable)
 * - Visual panel on the RIGHT (soft sweep + slow drift)
 * - Distinct copy from Login
 */
export default function CreateAccount() {
  // ---- Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    if (loading) return;
    setError("");

    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/users/register",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to create account.";
      setError(typeof message === "string" ? message : "Failed to create account.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Motion prefs
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Keyframes (mirror of login)
  const slowDrift = keyframes`
    0% { transform: translateY(0px) }
    50% { transform: translateY(-12px) }
    100% { transform: translateY(0px) }
  `;
  const slowDrift2 = keyframes`
    0% { transform: translateY(0px) }
    50% { transform: translateY(10px) }
    100% { transform: translateY(0px) }
  `;
  const sweep = keyframes`
    0% { transform: translateX(-40%) }
    100% { transform: translateX(40%) }
  `;

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        bgcolor: "#0b0b0f",
        px: { xs: 0, md: 2, lg: 4 },
        py: { xs: 0, md: 2, lg: 4 },
      }}
    >
      {/* LEFT: Form Panel — widened, relaxed rhythm */}
      <Grid
        item
        xs={12}
        lg={5}
        sx={{
          display: "grid",
          placeItems: "center",
          pr: { lg: 2 }, // tiny gutter between panels
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: { xs: 0, lg: 4 },
            bgcolor: "rgba(255,255,255,0.06)",
            border: { lg: "1px solid rgba(255,255,255,.10)" },
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          {/* Generous paddings */}
          <Box sx={{ px: { xs: 3.5, md: 5, xl: 6 }, pt: { xs: 3.5, md: 5, xl: 6 } }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.2 }}>
              Create your account
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,.78)", mt: 1 }}>
              Join <strong>PokéWorld</strong> and begin your adventure.
            </Typography>
          </Box>

          <Divider sx={{ my: { xs: 2.5, md: 3 }, borderColor: "rgba(255,255,255,.10)" }} />

          <Box
            component="form"
            onSubmit={handleRegister}
            noValidate
            sx={{
              px: { xs: 3.5, md: 5, xl: 6 },
              pb: { xs: 3.5, md: 5, xl: 6 },
            }}
          >
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoFocus
              required
              autoComplete="username"
              InputLabelProps={{
                sx: {
                  color: "rgba(255,255,255,.9)",
                  "&.Mui-focused": { color: "#f59e0b" }, 
                },
              }}
              FormHelperTextProps={{
                sx: {
                  "&.Mui-focused": { color: "#f59e0b" },
                },
              }}
              InputProps={{
                sx: {
                  color: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,.20)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,.40)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#f59e0b",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 2px rgba(245,158,11,0.35)",
                  },
                },
              }}
            />

           <TextField
            fullWidth
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="new-password"
            InputLabelProps={{
              sx: {
                color: "rgba(255,255,255,.9)",         
                "&.Mui-focused": {
                  color: "#f59e0b",                    
                },
              },
            }}
            InputProps={{
              sx: {
                color: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,.20)",  
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,.40)",   
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#f59e0b",                 
                },
                "&.Mui-focused": {
                  boxShadow: "0 0 0 2px rgba(245,158,11,0.35)", 
                },
                "& input": {
                  caretColor: "#f59e0b",                  
                },
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((s) => !s)}
                    edge="end"
                    sx={{
                      color: "rgba(255,255,255,.9)",
                      "&:hover": { color: "#f59e0b" },     
                    }}
                  >
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
            {error && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: "rgba(244,67,54,.15)", color: "#ffb4ab" }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                fontWeight: 800,
                letterSpacing: 0.2,
                textTransform: "none",
                fontSize: 16,
                background: "linear-gradient(90deg,#ef4444,#f59e0b)",
                "&:hover": { filter: "brightness(0.96)" },
              }}
            >
              {loading ? "Creating…" : "Create account"}
            </Button>

            {/* Centered switch-to-login text */}
            <Box sx={{ textAlign: "center", mt: 1.75, mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.82)" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#fde047", fontWeight: 700 }}>
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* RIGHT: Visual Panel — airy, calm animation */}
      <Grid
        item
        xs={12}
        lg={7}
        sx={{
          position: "relative",
          display: { xs: "none", lg: "flex" },
          alignItems: "stretch",
          overflow: "hidden",
          borderRadius: { lg: 4 },
          pl: { lg: 2 }, // tiny gutter between panels
          background:
            "radial-gradient(60% 50% at 15% 15%, rgba(255,122,24,0.55) 0%, rgba(255,122,24,0) 60%)," +
            "radial-gradient(60% 50% at 80% 10%, rgba(239,68,68,0.55) 0%, rgba(239,68,68,0) 60%)," +
            "radial-gradient(60% 55% at 50% 90%, rgba(250,204,21,0.55) 0%, rgba(250,204,21,0) 60%)",
        }}
      >
        {/* Dark overlay for contrast */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(3, 7, 18, 0.55) 0%, rgba(3,7,18,0.45) 30%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Gentle sweeping light */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "20%",
            left: "-30%",
            width: "160%",
            height: 240,
            borderRadius: 999,
            filter: "blur(40px)",
            opacity: 0.18,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.20), rgba(250,204,21,0.22), rgba(239,68,68,0.20))",
            animation: prefersReducedMotion ? "none" : `${sweep} 30s linear infinite alternate`,
          }}
        />

        {/* Subtle decorative blobs */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 80,
            left: -60,
            width: 260,
            height: 260,
            bgcolor: "rgba(255,255,255,0.07)",
            filter: "blur(12px)",
            borderRadius: "50%",
            animation: prefersReducedMotion ? "none" : `${slowDrift} 12s ease-in-out infinite`,
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: 120,
            right: 40,
            width: 200,
            height: 200,
            bgcolor: "rgba(255,255,255,0.06)",
            filter: "blur(12px)",
            borderRadius: "50%",
            animation: prefersReducedMotion ? "none" : `${slowDrift2} 10s ease-in-out infinite`,
          }}
        />

        {/* Content container with large internal padding */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            px: { lg: 10, xl: 14 },
            py: { lg: 10, xl: 14 },
          }}
        >
          {/* Top tokens */}
          <Stack direction="row" spacing={1.25}>
            <Chip
              icon={<Bolt sx={{ color: "#fde047 !important" }} />}
              label="PokéWorld"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.18)",
                "& .MuiChip-icon": { ml: 0.5, color: "rgba(255,255,255,0.9)" },
              }}
            />
            <Chip
              label="New trainers welcome"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.90)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            />
          </Stack>

          {/* Big headline block */}
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { lg: 56, xl: 64 },
                fontWeight: 900,
                lineHeight: 1.04,
                letterSpacing: -0.3,
                mb: 2.5,
                background: "linear-gradient(90deg,#ef4444,#f59e0b,#facc15)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textWrap: "balance",
              }}
            >
              Join PokéWorld and begin your adventure.
            </Typography>

            <Typography
              sx={{
                maxWidth: 680,
                color: "rgba(255,255,255,.88)",
                fontSize: { lg: 18, xl: 20 },
                lineHeight: 1.75,
              }}
            >
              Create your account to explore collections, track your journey, and connect seamlessly
              across devices. Your sessions are protected with encrypted transport and hardened
              tokens.
            </Typography>
          </Box>

          {/* Minimal feature strip */}
          <Stack direction="row" spacing={3} sx={{ color: "rgba(255,255,255,.80)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Shield fontSize="small" />
              <Typography variant="body2">Encrypted transport</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Bolt fontSize="small" />
              <Typography variant="body2">Fast & resilient</Typography>
            </Stack>
          </Stack>

          {/* Footer note */}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.55)", mt: 6 }}>
            © {new Date().getFullYear()} PokéWorld
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
