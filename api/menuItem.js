// Create express Router
const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

// Setup database
const sqlite3 = require('sqlite3');
const menuRouter = require('./menu');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
    const values = {$menuItemId: menuItemId};
    db.get(sql, values, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (menuItem) {
            req.menuItem = menuItem;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (error, menu) => {
        if (error) {
            next(error)
        } else {
            if (!name || !description || !inventory || !price || !menu) {
                res.sendStatus(400);
            }
            const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
            const values = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: req.params.menuId
            };
            db.run(sql, values, function(error) {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, menuItem) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(201).json({menuItem: menuItem});
                        }
                    });
                }
            });
        }
    });
});

menuItemRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (error, menu) => {
        if (error) {
            next(error);
        } else {
            if (!name || !description || !inventory || !price || !menu) {
                res.sendStatus(400);
            }
            const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = ${req.params.menuItemId}`;
            const values = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            };
            db.run(sql, values, error => {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (error, menuItem) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(200).json({menuItem: menuItem});
                        }
                    })
                }
            });
        }
    });
});

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    })
});

// Export router
module.exports = menuItemRouter;