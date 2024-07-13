import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';

function Login() {
    // States used to store username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setIsAuthenticated } = useAuth(); // Function used for authenticating users when login is successfull
    const navigate = useNavigate(); // Function used to navigate different routes (Homes.js if login succeeds)

    const handleLogin = async () => {
        try {
            // Makes an asynchronous POST request to the login endpoint of the backend API
            const response = await axios.post('http://localhost:5000/api/users/login', { username, password });

            // Successful request, set user as authenticated and redirect to homes page
            if (response.status === 200) {
                setIsAuthenticated(true);
                navigate('/');
            }
            // Sends alert due to unsuccessful request for login
        } catch (error) {
            alert('Login failed! ' + (error.response?.data?.message || ''));
            console.error('Login error:', error);
        }
    };

    // Login Form
    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
            {/* Background Gradient */}
            <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}>
                    <Paper sx={{ padding: 4, width: '100%' }}>
                        {/** Login Title **/}
                        <Typography component="h1" variant="h5" textAlign="center">
                            Login
                        </Typography>
                        {/** Username Field **/}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            autoFocus
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            sx={{
                                mt: 2,
                                '& .MuiOutlinedInput-root': {

                                    // Username text field border
                                    '& fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                    // Username text field border (hover)
                                    '&:hover fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                    // Username text field border (selected)
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                },
                                // Username placeholder text 
                                '& .MuiInputLabel-root': {
                                  color: 'black',
                                },
                                // Username placeholder text (selected)
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'black',
                                }
                              }}
                        />
                        {/** Password Field **/}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            sx={{
                                mt: 2,
                                '& .MuiOutlinedInput-root': {

                                    // Password text field border                                
                                    '& fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                    // Password text field border (hover)                                
                                    '&:hover fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                    // Password text field border (selected)                                
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#C22E28',
                                    },
                                },
                                // Password placeholder text 
                                '& .MuiInputLabel-root': {
                                  color: 'black',
                                },
                                // Password placeholder text (selected)
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: 'black',
                                }
                              }}
                        />
                        {/** Submit Login Button **/}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleLogin}
                            sx={{ mt: 3, mb: 2, backgroundColor: "#C22E28", '&:hover': { backgroundColor: '#B22222'}}}
                        >
                            Login
                        </Button>
                        {/** Switch to Create Account Form Link **/}
                        <Link to="/register" style={{ textDecoration: 'none'}}>
                            <Button variant="text" sx={{color: "#C22E28"}}>Don't have an account? Sign Up</Button>
                        </Link>
                    </Paper>
                </Box>
            </Container>
        </div>
    );
}

export default Login;