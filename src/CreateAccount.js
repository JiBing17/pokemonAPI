import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';

function CreateAccount() {
    // State hooks for handling form data and error messages
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');  

    // Tool used for navigation across routes
    const navigate = useNavigate(); 

    // Function handles registration form submission
    const handleRegister = async () => {
        // Check if username or password is empty
        if (!username || !password) {
            setError('Both fields are required.');
            return;  
        }

        try {
            // Attempt to register the user with the provided username and password
            await axios.post('http://localhost:5000/api/users/register', { username, password });
            alert('Account created successfully!');
            navigate('/login');  
        } catch (err) {
            setError(err.response.data || 'Failed to create account.');
        }
    };

    // Render the registration form
    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper sx={{ padding: 4, width: '100%', mt: 2 }}>
                    <Typography component="h1" variant="h5" textAlign="center">
                        Create Account
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
                        onClick={handleRegister}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    {error && <Typography color="error" textAlign="center">{error}</Typography>}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="text">Already have an account? Log In</Button>
                    </Link>
                </Paper>
            </Box>
        </Container>
    );
}

export default CreateAccount;
