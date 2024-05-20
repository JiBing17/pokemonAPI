const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

// In-memory data store for users
const users = {};

// Base URL for the PokeAPI
const BASE_URL = 'https://pokeapi.co/api/v2';

// Route to create a new account
app.post('/api/users/register', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(409).send('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    users[username] = { username, password: hashedPassword };
    res.status(201).send('User created');
});

// Route to login
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid username or password');
    }
    res.send('User logged in');
});

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
