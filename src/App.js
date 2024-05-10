import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PokemonDetails from "./PokemonDetails";
import Home from "./Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pokemon/:pokemonName" element={<PokemonDetails />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

