import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Provides authentication-related state and functions to the entire application
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use authentication context
export function useAuth() {
    return useContext(AuthContext);
}
