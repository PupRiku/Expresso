// Create express Router
const express = require('express');
const menuRouter = express.Router();

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuItem');

menuRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (error, menu) => {
        if (error) {
            next(error);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (error, menus) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {$title: title};
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({menu: menu});
                }
            });
        }
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = `UPDATE Menu SET title = $title WHERE id = ${req.params.menuId}`;
    const values = { $title: title };
    db.run(sql, values, function(error) {
       if (error) {
           next(error);
       } else {
           db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, menu) => {
               if (error) {
                   next(error);
               } else {
                   res.status(200).json({menu: menu});
               }
           });
       }
    });
});

// Export router
module.exports = menuRouter;