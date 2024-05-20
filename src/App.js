import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import PokemonDetails from './PokemonDetails';
import Login from './Login';
import CreateAccount from './CreateAccount';
import { AuthProvider, useAuth } from './AuthContext';

// ensures that only authenticated users can access the route
function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
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
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/pokemon/:pokemonName" element={<PrivateRoute><PokemonDetails /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;