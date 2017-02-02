const express = require('express');
let Client = require('../db/models/client');

const ClientObj = require('./client');

const routerClientsAPI = express.Router();

// on routes that end in /clients
// ----------------------------------------------------
routerClientsAPI.route('/clients')

// create the client (accessed at POST http://localhost:3000/api/clients)
    .post((req, res) => {

        let client = new Client(new ClientObj(req.body));

        client.save(err => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(client);
            }
        });
    })

    // get all (req.query is ZERO) or some (filtered by req.query) clients (accessed at GET http://localhost:3000/api/clients)
    .get((req, res) => {

        Client.find(new ClientObj(req.query).toSearch(), (err, clients) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(clients);
            }
        });

    })

    // delete all (req.body is ZERO) or some (filtered by req.body) clients (accessed at DELETE http://localhost:3000/api/clients)
    .delete((req, res) => {

        Client.remove(new ClientObj(req.body).toSearch(), (err) => { // {} - remove all collection
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json({message: 'Clients are deleted'});
            }
        });
    });


// on routes that end in /client/:client_id
// ----------------------------------------------------
routerClientsAPI.route('/clients/:client_id')

    .get(function (req, res) {

        Client.findById(req.params.client_id, (err, client) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json(client);
            }
        });
    })

    .put(function (req, res) {
        Client.findById(req.params.client_id, (err, client) => {
            if (err) {
                res.status(400).send(err);
            } else {
                let clientObj = new ClientObj(req.body).toSearch();
                Object.keys(clientObj).forEach(prop => {
                    client[prop] = clientObj[prop];
                });

                client.save((err) => {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.status(200).json(client);
                    }
                });
            }
        });
    })

    .delete(function (req, res) {
        Client.remove({_id: req.params.client_id}, (err) => {
            if (err) {
                res.status(400).send(err);
            } else {
                res.status(200).json({message: 'Client deleted'});
            }
        });
    });

module.exports = routerClientsAPI;