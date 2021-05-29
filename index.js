
const express = require('express');

const {getAllUsers,getDefault,getUser} = require("./handlers/demo");
const {fct_login,get_post,help_in_post,create_room} = require("./handlers/user");

// Create an Express object and routes (in order)
const app = express();
app.use('/users/firebase_login', fct_login);
app.use('/users/get_post', get_post);
app.use('/users/help_in_post', help_in_post);
app.use('/users/create_room', create_room);
app.use(getDefault);

// Set our GCF handler to our Express app.
exports.users = app;