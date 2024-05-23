import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            // Makes an asynchronous POST request to the login endpoint of the backend API
            const response = await axios.post('http://localhost:5000/api/users/login', { username, password });

            // Successfull request, set user as authenticated and redirect to homes page
            if (response.status === 200) {
                setIsAuthenticated(true);
                navigate('/');
            }
            // Sends alert due to unsuccessfull request for login
        } catch (error) {
            alert('Login failed! ' + (error.response?.data?.message || ''));
            console.error('Login error:', error);
        }
    };
    // Login Form
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
