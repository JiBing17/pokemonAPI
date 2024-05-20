const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());  // Enables CORS to allow cross-origin requests
app.use(bodyParser.json());  // Parses JSON bodies in incoming requests

const users = {};  // In-memory store for users

// Register new users with username and hashed password
app.post('/api/users/register', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(409).send('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    users[username] = { username, password: hashedPassword };
    res.status(201).send('User created');
});

// Login existing users 
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid username or password');
    }
    res.send('User logged in');
});

// Fetches Pokemon data from the PokeAPI
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

// Fetches detailed Pokemon data by name
app.get('/api/pokemon/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server on a specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
