const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Retrieve the list of books from booksdb.js
  try {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(books, null, 2)); // Send formatted JSON response
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" }); // Handle potential errors
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve the ISBN from the request parameters
  const { isbn } = req.params;

  // Check if the book with the given ISBN exists in the books database
  const book = books[isbn];

  // If the book exists, return its details
  if (book) {
    return res.status(200).json(book);
  }

  // If the book does not exist, return a 404 status with an error message
  return res.status(404).json({ message: "Book not found" });
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Retrieve the author's name from the request parameters
  const { author } = req.params;

  // Filter the books object to find books written by the given author
  const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  // If books are found, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  }

  // If no books are found, return a 404 status with an error message
  return res.status(404).json({ message: "No books found for the given author" });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params; // Extract the title from the request parameters

  // Filter books based on title (case-insensitive comparison)
  const booksByTitle = Object.values(books).filter((book) =>
    book.title.toLowerCase() === title.toLowerCase()
  );

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle); // Return matching books
  } else {
    return res.status(404).json({ message: "No books found with the given title" });
  }
});


//  Get book review
// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params; // Extract the ISBN from the request parameters

  // Check if the book exists
  if (books[isbn]) {
    const bookReviews = books[isbn].reviews; // Retrieve the reviews for the book
    return res.status(200).json(bookReviews || { message: "No reviews available for this book" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;  // Extract username and password from the request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user by adding them to the users database
  users[username] = { password };  // In a real-world scenario, you'd hash the password
  return res.status(201).json({ message: "User registered successfully" });
});



module.exports.general = public_users;
