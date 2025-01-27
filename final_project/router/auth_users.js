const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "existingUser", password: "existingPassword" }
];  // Array of user objects with username and password

module.exports.users = users;  // This will store user data with username and password

// Check if the username is valid (exists in the users array)
const isValid = (username) => {
  return users.some(user => user.username === username);  // Returns true if username exists
};

// Check if the provided username and password match an existing user
const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username); // Find user by username
  return user && user.password === password;  // Returns true if user is found and password matches
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;  // Extract username and password from the request body

  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(404).json({ message: "Username not found" });
  }

  // Check if the provided username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // If login is successful, create a JWT token
  const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });  // Create JWT token with username in payload

  // Return the token to the user
  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review (only authenticated users can do this)
// Add or modify a book review (only authenticated users can do this)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.header("Authorization");  // Get the token from the Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access denied, please login first" });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');  // Verify the token with the secret key
    const username = decoded.username;  // Extract username from the decoded token

    // Proceed with adding or modifying the review
    const { isbn } = req.params;
    const { review } = req.body;

    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }

    // Assuming you have a way to add the review to the books database
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has already reviewed this book, modify review if exists
    const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
    if (existingReviewIndex >= 0) {
      // Modify the existing review
      books[isbn].reviews[existingReviewIndex].review = review;
      return res.status(200).json({ message: "Review modified successfully" });
    } else {
      // Add new review if no review exists for this user
      books[isbn].reviews.push({ username, review });
      return res.status(200).json({ message: "Review added successfully" });
    }

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Delete a book review (only the user who posted the review can delete it)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.header("Authorization");  // Get the token from the Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access denied, please login first" });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');  // Verify the token with the secret key
    const username = decoded.username;  // Extract username from the decoded token

    // Proceed with deleting the review
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }

    // Assuming you have a way to manage the books database
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Find the review and check if it's the user's review
    const reviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
    if (reviewIndex < 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove the review if it's the user's review
    books[isbn].reviews.splice(reviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully" });

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
