'use strict';

const express = require('express');
const knex = require('../knex');
const { camelize, decamelize } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', function (request, response, next) {
  console.log('GET happened');
  knex('books')
    .orderBy('title')
    .then((result) => {
      // response.setHeader('Content-Type', 'application/json');
      response.setHeader('Accept', 'application/json');
      response.send(result);
    })
    .catch((err) => {
      next(err);
    });

});

// router.get('/:id', function(request, response, next) {
//   response.send(`Get User - ${request.params.id}`);
// });
//
// router.post('/', function(request, response, next) {
//   response.send('Create a User');
// });
//
// router.delete('/:id', function(request, response, next) {
//   response.send(`Delete User - ${request.params.id}`);
// });
//
// router.put('/:id', function(request, response, next) {
//   response.send(`Update User - ${request.params.id}`);
// });
//
// router.patch('/', function(request, response, next) {
//   response.send(`Update User - ${request.params.id}`);
// });

module.exports = router;
