import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PokemonDetails() {
  const { pokemonName } = useParams();
  console.log("name: ", pokemonName)
  
  return (
    <div>{pokemonName}</div>
  );
}

export default PokemonDetails;
