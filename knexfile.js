'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_dev'
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_test'
  },

  production: {
    client: 'pg',
    connection: 'postgres://tmosevuxjltkvq:fqKa4ed9OgeDlvuH9fPqN-GzUx@ec2-54-195-252-166.eu-west-1.compute.amazonaws.com:5432/d1ms7qf73r8d5g'
  }
};
