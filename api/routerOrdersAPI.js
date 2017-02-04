const express = require('express');
let Order = require('../db/models/order');
const OrderObj = require('./order');

let Client = require('../db/models/client');
const ClientObj = require('./client');

const drone = require('netology-fake-drone-api');

// socket
const WebSocket = require('ws');
const wss = new WebSocket.Server({
    port: 8080
});

const broadcastEvent = function(event, data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            let obj = {event: event};
            if(data) obj['data'] = data;
            client.send(JSON.stringify({event: event}));
        }
    });
};

const removeOrder = function(order) {
    Order.findById({_id: order._id}, (err, order) => {
        if (err) {
            console.log(err.message)
        } else {
            if(order == null) return; // order remove by client from UI

            // refund money to the client for broken order
            if (order['status'] == 'broken') {
                refund = true;
                Client.findOne({email: order.client_email}, (err, client) => {
                    if (err) {
                        console.log(err);
                    } else {
                    }
                    client['account'] = Number(client['account']) + Number(order.price); // refund money
                    client.save((err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Refund money for client " + client['name'] + ', price = ' + order.price);
                        }
                    });
                });
            }
            // delete order
            Order.remove({_id: order['_id']}, (err) => {
                if (err) {
                    console.log(err.message)
                } else {
                    if(refund) {
                        console.log("remove order for client " + order['client_email'] + " with refund")
                        broadcastEvent('update_client_' + order['client_email']);
                    } else {
                        console.log("remove order for client " + order['client_email'] + " without refund")
                        broadcastEvent('update_orders_client_' + order['client_email']);
                    }

                }
            });
        }
    });
};

const routerOrdersAPI = express.Router();

// on routes that end in /Orders
// ----------------------------------------------------
routerOrdersAPI.route('/orders')

// create the order (accessed at POST http://localhost:3000/api/orders)
    .post((req, res) => {

        let order = new Order(new OrderObj(req.body));

        order.save(err => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json({message: 'Order created'});
                broadcastEvent('update_orders_client_' + order['client_email']);
                broadcastEvent('update_orders_cook_' + order['status']);
            }
        });
    })

    // get all (req.query is ZERO) or some (filtered by req.query) orders (accessed at GET http://localhost:3000/api/orders)
    .get((req, res) => {

        Order.find(new OrderObj(req.query).toSearch(), (err, orders) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(orders);
            }
        });

    })

    // delete all (req.body is ZERO) or some (filtered by req.body) orders (accessed at DELETE http://localhost:3000/api/orders)
    .delete((req, res) => {

        Order.remove(new OrderObj(req.body).toSearch(), (err) => { // {} - remove all collection
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json({message: 'orders are deleted'});
            }
        });
    });


// on routes that end in /orders/:order_id
// ----------------------------------------------------
routerOrdersAPI.route('/orders/:order_id')

    .get(function (req, res) {

        Order.findById(req.params.order_id, (err, order) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(order);
            }
        });
    })

    .put(function (req, res) {
        Order.findById(req.params.order_id, (err, order) => {
            if (err) {
                res.status(400).send(err);
            } else {
                // broadcast for current state
                broadcastEvent('update_orders_cook_' + order['status']);
                broadcastEvent('update_orders_client_' + order['client_email']);

                let orderObj = new OrderObj(req.body).toSearch();
                Object.keys(orderObj).forEach(prop => {
                    order[prop] = orderObj[prop];
                });

                order.save((err) => {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        // broadcast for new state
                        broadcastEvent('update_orders_cook_' + order['status']);
                        broadcastEvent('update_orders_client_' + order['client_email']);

                        // use dron to delivery
                        if (order['status'] == 'delivered') {
                            drone.deliver()
                                .then(() => {
                                    order['status'] = 'completed';
                                    order.save((err) => {
                                        if(err) {
                                            console.log(err.message);
                                        } else {
                                            broadcastEvent('update_orders_client_' + order['client_email']);
                                            setTimeout(removeOrder, 30 * 1000, order);
                                        }
                                    });
                                })
                                .catch(() => {
                                    order['status'] = 'broken';
                                    order.save((err) => {
                                        if(err) {
                                            console.log(err.message);
                                        } else {
                                            broadcastEvent('update_orders_client_' + order['client_email']);
                                            setTimeout(removeOrder, 30 * 1000, order);
                                        }
                                    });
                                });
                        }
                        res.status(200).json({message: 'Order updated'});
                    }
                });
            }
        });
    })

    .delete(function (req, res) {
        Order.remove({_id: req.params.order_id}, (err) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json({message: 'Order deleted'});
            }
        });
    });

/*
routerOrdersAPI.route('/search_orders_by_status')
    .get((req, res) => {
        Order.aggregate([
            {$match: {status: req.query.status}},
            {
                $lookup: {
                    from: "dishes",
                    localField: "dish_id",
                    foreignField: "id",
                    as: "dishes"
                }
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "client_email",
                    foreignField: "email",
                    as: "clients"
                }
            },
            {
                $sort: {
                    id: -1
                }
            }
        ], (err, result) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    });

routerOrdersAPI.route('/search_orders_by_email')
    .get((req, res) => {
        Order.aggregate([
            {$match: {client_email: req.query.email}},
            {
                $lookup: {
                    from: "dishes",
                    localField: "dish_id",
                    foreignField: "id",
                    as: "dishes"
                }
            },
            {
                $lookup: {
                    from: "clients",
                    localField: "client_email",
                    foreignField: "email",
                    as: "clients"
                }
            },
            {
                $sort: {
                    id: -1
                }
            }
        ], (err, result) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    });
*/

module.exports = routerOrdersAPI;