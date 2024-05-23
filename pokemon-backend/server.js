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

// Object used to store user's information
const users = {};

// Base URL for the PokeAPI
const BASE_URL = 'https://pokeapi.co/api/v2';

// Route to handle POST request for new user
app.post('/api/users/register', async (req, res) => {

    const { username, password } = req.body;

    // If user name exist as key in users object it will return error 409
    if (users[username]) {
        return res.status(409).send('User already exists');
    }
    // Encryptes password for security puposes
    const hashedPassword = await bcrypt.hash(password, 8);
    users[username] = { username, password: hashedPassword };
    res.status(201).send('User created');
});

// Route to handle POST request for logging in returning users
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;

    // search user object with the given username from client side
    const user = users[username];

    // Return error 401 if no user or client's password doesn't match the one stored
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid username or password');
    }
    res.send('User logged in');
});

// GET request handler for the /api/pokemon endpoint.
app.get('/api/pokemon', async (req, res) => {

    // Gets current page, limit, and offset based on the query parameters passed from client side
    const { page = 1, limit = 48 } = req.query;
    const offset = (page - 1) * limit;
    try {
        // Makes API request with axios using the variables we have defined above (base url, offset, limit)
        const response = await axios.get(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
        res.json(response.data);
    // return error 500 if there was an error with the request
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET request handler for the /api/pokemon/:name endpoint.
app.get('/api/pokemon/:name', async (req, res) => {
    // extracts name from GET request parameters
    const { name } = req.params;
    try {
        // Makes API request with axios using the variables we have defined above (base url and name)
        const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
        res.json(response.data);
    // return error 500 if there was an error with the request
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
