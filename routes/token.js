'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const bcrypt = require('bcrypt');
const { camelizeKeys, decamelizeKeys } = require('humps');
const knex = require('../knex');
const router = express.Router();

require('dotenv').config();

function validate(request) {
  var token = request.cookies.token;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return false;
  }
  if(!decoded) {
    return false;
  } else {
    return true;
  }
}

router.get('/token', function(request, response, next) {
  response.set('Accept', 'application/json');

  if (validate(request)) {
    response.send(true);
  } else {
    response.send(false);
  }
});

router.post('/token', (request, response, next) => {
  response.set('Accept', 'application/json');
  const { email, password } = request.body;

  if (email === undefined) {
    return next(boom.create(400, "Email must not be blank"));
  }

  if (password === undefined) {
    return next(boom.create(400, "Password must not be blank"));
  }

  knex.select('id', 'first_name', 'last_name', 'email', 'hashed_password')
    .from('users')
    .where('email', email)
    .first()
    .then((result) => {
      if (!result) {
        return next(boom.create(400, "Bad email or password"));
      }

      if (bcrypt.compareSync(password, result.hashed_password)) {
        //passwords match
        delete result.hashed_password;
        const token = jwt.sign({userId: result.id}, process.env.JWT_SECRET, {
          expiresIn: '3h'
        });
        const exp = new Date(Date.now() + 1000 * 60 * 60 * 3);

        response.cookie('token', token, {
          httpOnly: true,
          expires: exp,
          secure: router.get('env') === 'production'
        });
        response.send(camelizeKeys(result));
      } else {
        //passwords do not match
        return next(boom.create(400, "Bad email or password"));
      }
    });
});

router.delete('/token', (request, response, next) => {
  response.set('Accept', 'application/json');
  response.clearCookie('token');
  response.send(true);
});

module.exports = router;
