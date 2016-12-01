'use strict';

const express = require('express');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
const boom = require('boom');

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

  knex('books')
    .max('id')
    .then((result) => {
      let maxId = result[0].max;

      response.setHeader('Accept', 'application/json');
      if (!request.params.id) {
        knex('books')
        .orderBy('title')
        .then((result) => {
          const sendResult = camelizeKeys(result);
          response.send(sendResult);
        })
        .catch((err) => {
          next(err);
        });
      } else if (isNaN(reqId)) {
        return next();
      } else if (reqId < 1 || reqId > maxId) {
        return next();
      } else {
        knex('books')
        .where('id', reqId)
        .then((result) => {
          if (result.length === 0) {
            return response.sendStatus(400);
          } else {
            const sendResult = camelizeKeys(result);
            response.send(sendResult[0]);
          }
        })
        .catch((err) => {
          next(err);
        });
      };
    });

});

router.post('/books', function(request, response, next) {
  let newBook = {};
  if (request.body.title === undefined) {
    next(boom.create(400, "Title must not be blank"));
  }
  if (request.body.author === undefined) {
    next(boom.create(400, "Author must not be blank"));
  }
  if (request.body.genre === undefined) {
    next(boom.create(400, "Genre must not be blank"));
  }
  if (request.body.description === undefined) {
    next(boom.create(400, "Description must not be blank"));
  }
  if (request.body.cover_url === undefined) {
    next(boom.create(400, "Cover URL must not be blank"));
  }
  newBook.title = request.body.title;
  newBook.author = request.body.author;
  newBook.genre = request.body.genre;
  newBook.description = request.body.description;
  newBook.cover_url = request.body.coverUrl;

  knex('books')
    .insert(newBook, ['id', 'title', 'author', 'genre', 'description', 'cover_url'])
    .then((result) => {
      response.set('Content-Type', 'application/json');
      const sendResult = camelizeKeys(result);
      response.send(sendResult[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', function(request, response, next) {
  let reqId = parseInt(request.params.id, 10);
  knex('books')
    .max('id')
    .then((result) => {
      let maxId = result[0].max;

      if (!request.params.id || (isNaN(reqId))) {
        return next();
      } else if (reqId < 1 || reqId > maxId) {
        return next();
      } else {
        knex('books')
          .where('id', reqId)
          .first()
          .then((result) => {
            if (!result) {
              return next();
            }

            return knex('books')
              .update({
                title: request.body.title,
                author: request.body.author,
                genre: request.body.genre,
                description: request.body.description,
                cover_url: request.body.coverUrl
              }, ['id', 'title', 'author', 'genre', 'description', 'cover_url'])
              .where('id', reqId);
          })
          .then((result) => {
            response.setHeader('Accept', 'application/json');
            const sendResult = camelizeKeys(result);
            response.send(sendResult[0]);
          })
          .catch((err) => {
            next(err);
          });
      };
  });
});

router.delete('/books/:id', function(request, response, next) {
  let reqId = parseInt(request.params.id, 10);
  let delBook;

  knex('books')
    .max('id')
    .then((result) => {
      let maxId = result[0].max;

      if (!reqId || isNaN(reqId)) {
        return next();
      } else if (reqId < 1 || reqId > maxId) {
        return next();
      } else {
        knex('books')
        .where ('id', reqId)
        .first()
        .then((delRow) => {
          if (!delRow) {
            return next();
          }
          delBook = delRow;
          return knex('books')
          .del()
          .where('id', reqId);
        })
        .then(() => {
          delete delBook.id;
          const sendResult = camelizeKeys(delBook);
          response.send(sendResult);
        })
        .catch((err) => {
          next(err);
        });
      };
    });
});


module.exports = router;
