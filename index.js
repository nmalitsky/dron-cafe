let mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/droncafe'); // connect to users storage

// import data for menu
let fs   = require('fs');
let app_args = process.argv.slice(2);
if(app_args[0]) {
  let data = JSON.parse(fs.readFileSync(app_args[0], 'utf8'));
  let Dish = require('./db/models/dish');
  Dish.collection.insertMany(data, function(err, docs) {});
}

// remove not actual data
let Order = require('./db/models/order');
Order.remove({ $or: [
        { "status" : "delivered" },
        { "status" : "completed" },
        { "status" : "broken" }
        ]
    }, (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log("Db with actual data")
    }
});

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// middleware to use for all requests
app.use((req, res, next) => {
	//console.log(req.url); // logged url
	next();
});

app.use('/', express.static(path.join(__dirname, 'app')));

// path - /api/users
app.use('/api', require('./api/routerClientsAPI'));

// path - /api/orders
app.use('/api', require('./api/routerOrdersAPI'));

// path - /api/dishes
app.use('/api', require('./api/routerDishesAPI'));

// middleware for handling all errors
// ATTENTION - must be AFTER ALL middlewares (app.use(...)) for exclude errors
app.use((err, req, res, next) => {
	res.status(err.status ? err.status : 500).end(err.message);
});

app.all('/kitchen', (req, res) => {
	res.redirect('/#!/viewCook');
});

app.listen(port);
console.log('Listening Dron Cafe Server on port ' + port);
