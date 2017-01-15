const express = require('express');
let Dish = require('../db/models/dish'); 

const DishObj = require('./dish');

const routerDishesAPI = express.Router();

// on routes that end in /Dishes
// ----------------------------------------------------
routerDishesAPI.route('/dishes')

	// create the dish (accessed at POST http://localhost:3000/api/dishes)
	.post((req, res) => {

        	let dish = new Dish(new DishObj(req.body));

		dish.save(err => {
			if(err) {
				res.status(400).send(err);
			} else {
				res.status(200).json({ message: 'Dish created'});
			}
		});
	})

	// get all (req.query is ZERO) or some (filtered by req.query) dishes (accessed at GET http://localhost:3000/api/dishes)
	.get((req, res) => {

	        Dish.find(new DishObj(req.query).toSearch(), (err, dishes) => {
			if(err) {
				res.status(400).send(err);
			} else {
		            	res.status(200).json(dishes);
			}
	        });

	})

	// delete all (req.body is ZERO) or some (filtered by req.body) dishes (accessed at DELETE http://localhost:3000/api/dishes)
	.delete((req, res) => {

		Dish.remove(new DishObj(req.body).toSearch(), (err) => { // {} - remove all collection
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'dishes are deleted' });
			}
		});
	});


// on routes that end in /dishes/:dish_id
// ----------------------------------------------------
routerDishesAPI.route('/dishes/:dish_id')

	.get(function(req, res) {

        	Dish.findById(req.params.dish_id, (err, dish) => {
			if(err) {
				res.status(400).send(err);
			} else {
	            		res.status(200).json(dish);
			}
        	});
    	})


	.put(function(req, res) {
		Dish.findById(req.params.dish_id, (err, dish) => {
			if(err) {
				res.status(400).send(err);
			} else {
				let dishObj = new DishObj(req.body).toSearch(); // toSearch() need if NOT COMPLETE obj properties in req.body, example only: { "status": "close" }
				Object.keys(dishObj).forEach(prop => { dish[prop] = dishObj[prop]; });

				dish.save((err) => {
					if(err) {
						res.status(400).send(err);
					} else {
						res.status(200).json({ message: 'Dish updated' });
					}
				});
			}
	        });
	})

	.delete(function(req, res) {
		Dish.remove({_id: req.params.dish_id}, (err) => {
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'Dish deleted' });
			}
		});
	});

module.exports = routerDishesAPI;