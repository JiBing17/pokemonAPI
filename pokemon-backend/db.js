const { MongoClient } = require('mongodb'); // Import the MongoClient class from the mongodb package

require('dotenv').config(); // Load environment variables from a .env file into process.env

const uri = process.env.MONGODB_URI; // Retrieve the MongoDB connection URI from environment variables

// Create a new MongoClient instance with the connection URI and options
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db; // Initialize a variable to hold the database connection

// Function to connect to the MongoDB database and it returns the database connection object
async function connectToDatabase() {
  // If the database connection is not already established, establish it
  if (!db) {
    try {
      // Connect to the MongoDB server and select the targeted database
      await client.connect();
      db = client.db('pokeAPI');
      console.log('Connected to MongoDB');

    // Log any errors that occur during the connection process
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
    }
  }
  // Return the database connection object
  return db;
}

// Export the connectToDatabase function for use in other parts of the application
module.exports = connectToDatabase;