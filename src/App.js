import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Correct import statement
import PokemonDetails from "./PokemonDetails"; // Import the component for the Pokemon detail page
import Home from "./Home"; 

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/pokemon/:name" element={<PokemonDetails />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
