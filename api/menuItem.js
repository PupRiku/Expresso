// Create express Router
const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

// Setup database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Export router
module.exports = timesheetRouter;