'use strict';

const express = require('express');
const knex = require('../knex');
const { camelizeKeys } = require('humps');
const boom = require('boom');
const bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/users', function(request, response, next) {
  let newUser = {};

  response.set('Content-Type', 'application/json');

  if (request.body.firstName === undefined) {
    return next(boom.create(400, "First name must not be blank"));
  }
  if (request.body.lastName === undefined) {
    return next(boom.create(400, "Last name must not be blank"));
  }
  if (request.body.password === undefined || request.body.password.length < 8) {
    return next(boom.create(400, "Password must be at least 8 characters long"));
  }
  if (request.body.email === undefined) {
    return next(boom.create(400, "Email must not be blank"));
  }

  knex('users')
    .where('email', request.body.email)
    .first()
    .then((result) => {
      if (result.email !== request.body.email) {
        newUser.first_name = request.body.firstName;
        newUser.last_name = request.body.lastName;
        newUser.email = request.body.email;

        let hash = bcrypt.hashSync(request.body.password, 8);

        newUser.hashed_password = hash;

        knex('users')
        .insert(newUser, ['id', 'first_name', 'last_name', 'email'])
        .then((result) => {
          console.log("insert happened");
          const sendResult = camelizeKeys(result);
          response.send(sendResult[0]);
        })
        .catch((err) => {
          next(err);
        });
      } else {
        return next(boom.create(400, "Email already exists"));
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
