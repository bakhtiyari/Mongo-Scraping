// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var path = require('path');

var request = require("request"); 
var cheerio = require("cheerio"); 

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initializing Express
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname, 'public')));

var PORT = process.env.PORT || 3000;

//Require Handlebars
var exphbs = require("express-handlebars");
var Handlebars = require("handlebars");

// Setting handlebars as view engine.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Using morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Importing routes and giving the server access to them.
var routes = require('./controllers/controller');
app.use('/', routes);

// Determining whether to use local or remote database connection.
var connectionString;
if (process.env.PORT) {
    connectionString = 'mongodb://heroku_07wvwgz7:1k94sqogioglh79h3sa3qf0mc@ds123311.mlab.com:23311/heroku_07wvwgz7';
} else {
    connectionString = 'mongodb://localhost/newsScraper';
}

mongoose.connect(connectionString);
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
