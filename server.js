// Node Module Imports
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

// Router Imports
const apiRouter = require("./api/api");

// App setup
const app = express();
const PORT = process.env.PORT || 4000;

// App doc config
app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());
app.use(morgan('dev'));

// Routes setup
app.use('/api', apiRouter);

// Start App
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

// Export server
module.exports = app;