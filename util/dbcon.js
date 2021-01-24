require('dotenv').config();
const mysql = require('mysql');
const { promisify } = require('util'); // util from native nodejs library
const { HOST, USERNAME2, PASSWORD, DATABASE } = process.env;

// DB connection
const con = mysql.createConnection({
  host: HOST, // MYSQL HOST NAME
  user: USERNAME2, // MYSQL USERNAME
  password: PASSWORD, // MYSQL PASSWORD
  database: DATABASE, // MYSQL DB NAME
});

con.connect(function (err) {
  console.log('DB Connected!');
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
