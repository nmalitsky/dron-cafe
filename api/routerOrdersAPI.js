const express = require('express');
let Order = require('../db/models/order'); 

const OrderObj = require('./order');

const routerOrdersAPI = express.Router();

// on routes that end in /Orders
// ----------------------------------------------------
routerOrdersAPI.route('/orders')

	// create the order (accessed at POST http://localhost:3000/api/orders)
	.post((req, res) => {

        	let order = new Order(new OrderObj(req.body));

		order.save(err => {
			if(err) {
				res.status(400).send(err);
			} else {
				res.status(200).json({ message: 'Order created'});
			}
		});
	})

	// get all (req.query is ZERO) or some (filtered by req.query) orders (accessed at GET http://localhost:3000/api/orders)
	.get((req, res) => {

	        Order.find(new OrderObj(req.query).toSearch(), (err, orders) => {
			if(err) {
				res.status(400).send(err);
			} else {
		            	res.status(200).json(orders);
			}
	        });

	})

	// delete all (req.body is ZERO) or some (filtered by req.body) orders (accessed at DELETE http://localhost:3000/api/orders)
	.delete((req, res) => {

		Order.remove(new OrderObj(req.body).toSearch(), (err) => { // {} - remove all collection
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'orders are deleted' });
			}
		});
	});


// on routes that end in /orders/:order_id
// ----------------------------------------------------
routerOrdersAPI.route('/orders/:order_id')

	.get(function(req, res) {

        	Order.findById(req.params.order_id, (err, order) => {
			if(err) {
				res.status(400).send(err);
			} else {
	            		res.status(200).json(order);
			}
        	});
    	})


	.put(function(req, res) {
		Order.findById(req.params.order_id, (err, order) => {
			if(err) {
				res.status(400).send(err);
			} else {
				let orderObj = new OrderObj(req.body).toSearch(); // toSearch() need if NOT COMPLETE obj properties in req.body, example only: { "status": "close" }
				Object.keys(orderObj).forEach(prop => { order[prop] = orderObj[prop]; });

				order.save((err) => {
					if(err) {
						res.status(400).send(err);
					} else {
						res.status(200).json({ message: 'Order updated' });
					}
				});
			}
	        });
	})

	.delete(function(req, res) {
		Order.remove({_id: req.params.order_id}, (err) => {
			if(err) {
				res.status(400).send(err);
			} else {
		       		res.status(200).json({ message: 'Order deleted' });
			}
		});
	});

module.exports = routerOrdersAPI;