var express = require('express');
var path = require('mysql2');

var app = express();
app.use(express.json());


let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'walker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dogs table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
        )
      `);

    // Walk Requests table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS WalkRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    dog_id INT NOT NULL,
    requested_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
        )
      `);


    // Walk Applications table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS WalkApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    CONSTRAINT unique_application UNIQUE (request_id, walker_id)
        )
      `);


    // Walk Ratings table
    await db.execute(`

        CREATE TABLE IF NOT EXISTS WalkRatings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    owner_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
        )
      `);


  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to get users
app.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Route to get dogs
app.get('/api/dogs', async (req, res) => {
    try {
      const [dogs] = await db.execute('SELECT * FROM dogs');
      res.json(dogs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch dogs' });
    }
  });

  // Route to get walkrequests open
app.get('/api/walkrequests/open', async (req, res) => {
    try {
      const [walks] = await db.execute('SELECT * FROM walkrequests WHERE ');
      res.json(walks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch dogs' });
    }
  });

    // Route to get walkrequests open
app.get('/api/walkers/summary', async (req, res) => {
    try {
      const [dogs] = await db.execute('SELECT * FROM dogs');
      res.json(dogs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch dogs' });
    }
  });





app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;