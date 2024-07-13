import React, { createContext, useContext, useState } from 'react';

// First instance of AuthContext with value of null
const AuthContext = createContext(null);

// Provides authentication state and functions to the entire application
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    return (
        // state and function to set state is passed to childrens that this wraps around
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use authentication context
export function useAuth() {
    return useContext(AuthContext);
}