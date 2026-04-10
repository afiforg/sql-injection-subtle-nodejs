/**
 * Service layer: forwards request-derived data to repository.
 * No SQL here; taint flows through to repository where sink runs in loops.
 */


userRepository = require('../repositories/userRepository');

async function getUsersByIds(db, ids) {
  return userRepository.findByMultipleIds(db, ids);
}

async function getUsersByFilters(db, filters) {
  return userRepository.findByFilters(db, filters);
}

async function getUsersByIdsSinkInLoop(db, ids) {
  return userRepository.findByMultipleIdsSinkInLoop(db, ids);
}

async function getUsersByFiltersSinkInLoop(db, filters) {
  return userRepository.findByFiltersSinkInLoop(db, filters);
}

module.exports = {
  getUsersByIds,
  getUsersByFilters,
  getUsersByIdsSinkInLoop,
  getUsersByFiltersSinkInLoop,
};
