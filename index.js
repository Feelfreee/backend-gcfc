
const express = require('express');

const {getAllUsers,getDefault,getUser} = require("./handlers/demo");
const {fct_login,get_post,help_in_post,create_room,rate_user} = require("./handlers/user");
const {post_sentiments} = require("./handlers/symbai");
// Create an Express object and routes (in order)
const app = express();
app.use('/users/firebase_login', fct_login);
app.use('/users/get_post', get_post);
app.use('/users/help_in_post', help_in_post);
app.use('/users/create_room', create_room);
app.use('/users/rate_user', rate_user);
app.use('/ai/post_sentiment', post_sentiments);


app.use(getDefault);

// Set our GCF handler to our Express app.
exports.users = app;