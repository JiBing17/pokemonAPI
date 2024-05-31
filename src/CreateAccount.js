import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container, Box } from '@mui/material';

function CreateAccount() {
    // State hooks for handling form data and error messages
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');  

    const navigate = useNavigate(); // Tool used for navigation across routes (Used to go to Login Route after new account is created)

    // Function handles registration form submission
    const handleRegister = async () => {

        // Check if username or password is empty
        if (!username || !password) {
            setError('Both fields are required.');
            return;  
        }

        try {
            // Makes an asynchronous POST request to the register endpoint of the backend API
            await axios.post('http://localhost:5000/api/users/register', { username, password });
            alert('Account created successfully!');
            navigate('/login');  // Takes user back to login Page to login the newly created account

        } catch (err) {
            setError(err.response.data || 'Failed to create account.'); // Sets error if any that will display at bottom of form

        }
    };

    // Create Account Form
    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: "0px 2px 4px rgba(0,0,0,0.5)"}}>
                <Paper sx={{ padding: 4, width: '100%', mt: 2 }}>
                    {/** Create Account Title **/}
                    <Typography component="h1" variant="h5" textAlign="center">
                        Create Account
                    </Typography>
                    {/** Create Username Field **/}
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
                              '& fieldset': {
                                borderColor: '#C22E28',
                              },
                              '&:hover fieldset': {
                                borderColor: '#C22E28',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#C22E28',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'black',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#black',
                            }
                          }}
                    />
                    {/** Create Password Field **/}
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
                              '& fieldset': {
                                borderColor: '#C22E28',
                              },
                              '&:hover fieldset': {
                                borderColor: '#C22E28',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#C22E28',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'black',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#black',
                            }
                          }}
                    />
                    {/** Submit to Create New User Button **/}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleRegister}
                        sx={{ mt: 3, mb: 2, backgroundColor: "#C22E28", '&:hover': { backgroundColor: '#B22222'}}}
                    >
                        Sign Up
                    </Button>
                    {/** Switch to Create Account Form Link**/}
                    {error && <Typography color="error" textAlign="center">{error}</Typography>}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="text" sx={{color: "#C22E28"}}>Already have an account? Log In</Button>
                    </Link>
                </Paper>
            </Box>
        </Container>
    );
}

export default CreateAccount;