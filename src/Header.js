import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from './AuthContext';

function Header() {
    // Get the setIsAuthenticated function from the authentication context
    const { setIsAuthenticated } = useAuth();
    
    // Tool to navigate to different routes
    const navigate = useNavigate();

    // Function to handle logout process
    const handleLogout = () => {
        // set authentication to false and goes back to login page
        setIsAuthenticated(false);
        navigate('/login');
    };
    
    return (
        <AppBar position="fixed" style={{ background: '#C22E28' }}>  
            <Toolbar>
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pokémon_logo.svg"
                        style={{ height: '40px'}}
                    />
                </Box>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
