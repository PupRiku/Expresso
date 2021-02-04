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

// Export router
module.exports = timesheetRouter;