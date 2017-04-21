// Importing dependencies.
var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Initializing app.
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname, 'public')));

var PORT = process.env.PORT || 3000;

// Set handlebars as view engine.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Importing routes and giving the server access to them.
var routes = require('./controllers/controller');
app.use('/', routes);

// Determining whether to use local or remote database connection.
var connectionString;
if (process.env.PORT) {
    connectionString = 'mongodb://heroku';
} else {
    connectionString = 'mongodb://localhost/mongonews';
}

// Start listening.
mongoose.connect(connectionString).then(function() {
    app.listen(PORT, function() {
        console.log('listening on port ' + PORT);
    });
});
