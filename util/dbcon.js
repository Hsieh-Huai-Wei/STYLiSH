require('dotenv').config();
const mysql = require('mysql');
const { promisify } = require('util');
const env = process.env.NODE_ENV || 'production';
const multipleStatements = process.env.NODE_ENV === "test";
const { HOST, USERNAME, PASSWORD, DATABASE, DATABASE_TEST } = process.env;

const mysqlConfig = {
  production: {
    // for EC2 machine
    host: HOST,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE,
  },
  development: {
    // for localhost development
    host: HOST,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    host: HOST,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE_TEST,
  },
};

const con = mysql.createConnection(mysqlConfig[env], {
  multipleStatements
});

const promiseQuery = (query, bindings) => {
  return promisify(con.query).bind(con)(query, bindings);
};

const promiseTransaction = promisify(con.beginTransaction).bind(con);
const promiseCommit = promisify(con.commit).bind(con);
const promiseRollback = promisify(con.rollback).bind(con);
const promiseEnd = promisify(con.end).bind(con);

module.exports = {
  con: con,
  query: promiseQuery,
  transaction: promiseTransaction,
  commit: promiseCommit,
  rollback: promiseRollback,
  end: promiseEnd,
};
