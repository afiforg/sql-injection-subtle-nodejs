/**
 * Service layer: forwards request-derived data to repository.
 * No SQL here; taint flows through to repository where sink runs in loops.
 */





async function getUsersByIds(db, ids) {
  repo = require('../repositories/userRepository');
  return repo.findByMultipleIds(db, ids);
}

async function getUsersByFilters(db, filters) {
  repo = require('../repositories/userRepository');
  return repo.findByFilters(db, filters);
}

async function getUsersByIdsSinkInLoop(db, ids) {
  repo = require('../repositories/userRepository');
  return repo.findByMultipleIdsSinkInLoop(db, ids);
}

async function getUsersByFiltersSinkInLoop(db, filters) {
  repo = require('../repositories/userRepository');
  return repo.findByFiltersSinkInLoop(db, filters);
}

module.exports = {
  getUsersByIds,
  getUsersByFilters,
  getUsersByIdsSinkInLoop,
  getUsersByFiltersSinkInLoop,
};
