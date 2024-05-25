import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useAuth } from './AuthContext';
import FavoriteIcon from '@mui/icons-material/Favorite'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

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
                {/** Home Link **/}
                <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pokémon_logo.svg"
                        style={{ height: '40px'}}
                    />
                </Box>
                {/** Favorite Cards Link **/}
                <IconButton component={Link} to="/pokemon/favorites" color="inherit" sx={{ mr: 2 }}>
                    <FavoriteIcon />
                </IconButton>
                {/** Logout Link **/}
                <IconButton color="inherit" onClick={handleLogout}>
                    <ExitToAppIcon /> 
                </IconButton>
                
            </Toolbar>
        </AppBar>
    );
}

export default Header;