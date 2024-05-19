const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Base URL for the PokeAPI
const BASE_URL = 'https://pokeapi.co/api/v2';

// Route to fetch Pokemon data
app.get('/api/pokemon', async (req, res) => {
  const { page = 1, limit = 48 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const response = await axios.get(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch Pokemon details
app.get('/api/pokemon/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
