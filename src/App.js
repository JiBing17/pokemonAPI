import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import PokemonDetails from './PokemonDetails';
import Login from './Login';
import CreateAccount from './CreateAccount';
import { AuthProvider, useAuth } from './AuthContext';
import Favorites from './Favorites';
import VideoGames from './VideoGames';
import Contact from './Contact';
import Movies from './Movies';
import Games from './Games';
import MovieDetail from './MovieDetail.js';
import Items from './Items.js';
import SetGallery from './SetGallery.js';
// ensures that only authenticated users can access the route
function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();

    // Takes user to component that Private Route is wrapped around or Login Page if not true
    return isAuthenticated ? children : <Navigate to="/login" />;
}

// Sets up the router and provides authentication context to all routes
function App() {
    return (
        <AuthProvider>  { /** Provides authentication state to all child components **/}
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<CreateAccount />} />
                    {/** Only if boolean value isAuthenicated is true will these bottom routes be available**/}
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/pokemon/:pokemonName" element={<PrivateRoute><PokemonDetails /></PrivateRoute>} />
                    <Route path="/pokemon/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
                    <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
                    <Route path="/videogames" element={<PrivateRoute><VideoGames /></PrivateRoute>} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/movie/:id" element={<MovieDetail />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/sets" element={<SetGallery />} />


                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;