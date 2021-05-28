
const express = require('express');

const {getAllUsers,getDefault,getUser} = require("./handlers/demo");
const {fct_login} = require("./handlers/user");

// Create an Express object and routes (in order)
const app = express();
app.use('/users/firebase_login', fct_login);
app.use(getDefault);

// Set our GCF handler to our Express app.
exports.users = app;