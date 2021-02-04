// Create express Router
const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

// Export router
module.exports = menuItemRouter;