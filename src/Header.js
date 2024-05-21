import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
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
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
                >
                    PokeAPI Data
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
