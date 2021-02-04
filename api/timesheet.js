// Create express Router
const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

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

// Export router
module.exports = timesheetRouter;