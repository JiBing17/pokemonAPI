import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PokemonDetails from "./PokemonDetails";
import Home from "./Home";

function App() {

  // Function used to navigate to the home page (page 1) 
  const handleHeaderClick = () => {
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div className="container mx-auto px-4">
        <div className="fixed top-0 left-0 w-full bg-white z-10 shadow-md py-4 px-4">
          { /* When the header link is clicked, navigate to the home page */ }
          <Link to="/" className="text-4xl font-bold py-4 text-center md:text-left md:ml-4 md:py-0 md:w-auto md:mr-auto" onClick={handleHeaderClick}>
            PokeAPI Data
          </Link>
        </div>
      </div>
      <Routes>
        <Route path="/pokemon/:pokemonName" element={<PokemonDetails />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
