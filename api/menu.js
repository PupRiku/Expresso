// Create express Router
const express = require('express');
const menuRouter = express.Router();

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (error, menus) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

// Export router
module.exports = menuRouter;