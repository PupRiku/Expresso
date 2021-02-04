// Create express Router
const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get(sql, values, (error, timesheet) => {
        if (error) {
            next(error);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (error, timesheets) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    if(!hours || ! rate || !date ) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, timesheet) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({timesheet: timesheet});
                }
            })
        }
    });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    const employeeSql = 'SELECT * FROM Employee WHERE id = $employeeId';
    const employeeValues = {$employeeId: employeeId}
    db.get(employeeSql, employeeValues, (error, employee) => {
        if (error) {
            next(error)
        } else {
            if(!hours || ! rate || !date || !employee) {
                return res.sendStatus(400);
            }
            const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId';
            const values = {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employeeId: employeeId,
                $timesheetId: req.params.timesheetId
            };
            db.run(sql, values, error => {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (error, timesheet) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(200).json({timesheet: timesheet});
                        }
                    });
                }
            });
        }
    });
});

// Export router
module.exports = timesheetRouter;