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
        console.log("res: " , response)
        console.log("res++: " ,response.data)

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
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">PokeAPI Data</h1>
      <pre className="bg-gray-200 p-4 rounded-lg">{JSON.stringify(pokemonData, null, 2)}</pre>
    </div>
  );
}

export default App;
