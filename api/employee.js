// Create express Router
const express = require('express');
const employeeRouter = express.Router();

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetRouter = require('./timesheet');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = 'SELECT * FROM Employee WHERE id = $employeeId';
    const values = { $employeeId: employeeId };
    db.get(sql, values, (error, employee) => {
        if (error) {
            next(error);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

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

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if(!name || ! position || !wage) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };
    db.run(sql, values, error => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({employee: employee});
                }
            });
        }
    });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`, error => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, employee) => {
                if (error) {
                    next(error);
                } else {
                    res.status(200).json({employee: employee});
                }
            });
        }
    });
});

// Export router
module.exports = employeeRouter;