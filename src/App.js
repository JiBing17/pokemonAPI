import React, { useState, useEffect } from "react";
import axios from "axios"

const BASE_URL = "http://pokeapi.co/api/v2"

function App() {
  const [pokemonData , setPokemonData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const fetchedData = async () => {
      try {
        const response = await axios.get(BASE_URL);
        setPokemonData(response.data)
      } catch (error) {
          setError(error);
      }
    }

    fetchedData();
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!pokemonData) {
    return <div>Loading...</div>
  }
  return (
    <div>
        <h1>PokeAPI Data</h1>
        <pre>{JSON.stringify(pokemonData, null, 2)}</pre>
    </div>
  )
}

export default App;
