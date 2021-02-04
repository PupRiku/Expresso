// Import node modules
const express = require('express');

// setup api router
const apiRouter = express.Router();

// Import routers
const employeeRouter = require('./employee');
const menuRouter = require('./menu');

// Mount routes
apiRouter.use('/employees', employeeRouter);
apiRouter.use('/menu', menuRouter);

// Export router
module.exports = apiRouter;