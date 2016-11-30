'use strict';

const express = require('express');
const knex = require('../knex');
const { camelize, decamelize } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

//get all or get only the element with the requested id
// router.get('/books/:id?', function (request, response, next) {
//   let reqId = parseInt(request.params.id, 10);
//   knex('books')
//     .orderBy('title')
//     .then((result) => {
//       response.setHeader('Accept', 'application/json');
//       if (reqId && !(isNaN(reqId))) {
//         for (let i=0;i<result.length;i++) {
//           if (result[i].id === reqId) {
//             response.send(result[i]);
//           }
//         }
//       } else {
//         response.send(result);
//       };
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

router.get('/books/:id?', function (request, response, next) {
  let reqId = parseInt(request.params.id, 10);

  response.setHeader('Accept', 'application/json');
  if (!request.params.id) {
    knex('books')
      .orderBy('title')
      .then((result) => {
        response.send(result);
      })
      .catch((err) => {
        next(err);
      });
  } else if (isNaN(reqId)) {
    return response.sendStatus(400);
  } else if (reqId && !(isNaN(reqId))) {
    knex('books')
      .where('id', reqId)
      .then((result) => {
        response.send(result);
      })
      .catch((err) => {
        next(err);
      });
  };
});

router.post('/books', function(request, response, next) {
  
});
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
