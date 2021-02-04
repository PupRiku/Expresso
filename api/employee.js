// Create express Router
const express = require('express');
const employeeRouter = express.Router();

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || ! position || !wage) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({employee: employee});
                }
            });
        }
    });
});

// Export router
module.exports = employeeRouter;