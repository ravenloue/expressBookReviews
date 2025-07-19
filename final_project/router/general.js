const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(400).json(
            { message: "Username and password are required" });
    }

    if (users.find((user) => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }
    
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

public_users.get('/',async function (req, res) {
    try {
        const bookList = await getBooks(); 
        res.json(bookList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving book list" });
    }
});

// Get book details based on ISBN
const getByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
};

public_users.get('/isbn/:isbn',function (req, res) {
      getByISBN(req.params.isbn)
        .then(
            result => res.send(result),
            error => res.status(error.status).json({message: error.message})
    );
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.author === author))
        .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
        .then((bookEntries) => Object.values(bookEntries))
        .then((books) => books.filter((book) => book.title === title))
        .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getByISBN(req.params.isbn)
        .then(
            result => res.send(result.reviews),
            error => res.status(error.status).json({message: error.message})
    );
});

module.exports.general = public_users;
