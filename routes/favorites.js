'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const boom = require('boom');
const { camelizeKeys, decamelizeKeys } = require('humps');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

const auth = (request, response, next) => {
  const token = request.cookies.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    request.token = decoded;
    next();
  });

};

router.get('/favorites', auth, (request, response, next) => {

    knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('user_id', request.token.userId)
    .then((result) => {

      const camelizedResult = camelizeKeys(result);
      response.send(camelizedResult);
    })
    .catch((err) => {
      return next(err);
    });

});

router.get('/favorites/check', auth, (request, response, next) => {
  const bookId = parseInt(request.query.bookId, 10);

  if ((typeof bookId) === 'number' && !isNaN(bookId)) {
    knex('books')
      .innerJoin('favorites', 'favorites.book_id', 'books.id')
      .where({
        'favorites.user_id': request.token.userId,
        'favorites.book_id': request.query.bookId
      })
      .first()
      .then((result) => {
        if (result) {
          return response.send(true);
        }

        response.send(false);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    return next(boom.create(400, "Book ID must be an integer"));
  }

});

router.post('/favorites', auth, (request, response, next) => {
  const bookId = parseInt(request.body.bookId, 10);

  if ((typeof bookId) === 'number' && !isNaN(bookId)) {
    knex('books')
      .max('id')
      .then((result) => {
        let maxId = result[0].max;

        if (bookId > 0 && bookId <= maxId) {
          knex('favorites')
          .insert({
            book_id: request.body.bookId,
            user_id: request.token.userId
          }, ['id', 'book_id', 'user_id'])
          .then((result) => {
            const newRow = camelizeKeys(result[0]);

            response.send(newRow);
          })
          .catch((err) => {
            next(err);
          });
        } else {
          return next(boom.create(404, "Book not found"));
        }
      });
  } else {
    return next(boom.create(400, "Book ID must be an integer"));
  }
});

router.delete('/favorites', auth, (request, response, next) => {
  let delBook;
  const bookId = parseInt(request.body.bookId);

  if ((typeof bookId) === 'number' && !isNaN(bookId)) {
    knex('favorites')
    .where('book_id', request.body.bookId)
    .andWhere('user_id', request.token.userId)
    .first()
    .then((result) => {
      if (!result) {
        return next(boom.create(404, 'Favorite not found'));
      }

      delBook = camelizeKeys(result);

      return knex('favorites')
      .del()
      .where('id', delBook.id);
    })
    .then(() => {
      delete delBook.id;

      response.send(delBook);
    })
    .catch((err) => {
      next(err);
    });
  } else {
    return next(boom.create(400, 'Book ID must be an integer'));
  }
});

module.exports = router;
