import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';

function Login() {
    // State variables for storing username and password input values
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Get the setIsAuthenticated function from the authentication context
    const { setIsAuthenticated } = useAuth();
    
    // Tool to navigate to different routes
    const navigate = useNavigate();

    // Function to handle login process
    const handleLogin = async () => {
        try {
            // Make a POST request to the login endpoint with username and password
            await axios.post('http://localhost:5000/api/users/login', { username, password });
            setIsAuthenticated(true);
            navigate('/'); 
        } catch (error) {
            // If login fails, show an alert and log the error to the console
            alert('Login failed!');
            console.error('Login error:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper sx={{ padding: 4, width: '100%', mt: 2 }}>
                    <Typography component="h1" variant="h5" textAlign="center">
                        Login
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        autoFocus
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleLogin}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <Button variant="text">Don't have an account? Sign Up</Button>
                    </Link>
                </Paper>
            </Box>
        </Container>
    );
}

export default Login;