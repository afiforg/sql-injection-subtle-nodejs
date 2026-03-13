const { buildCondition, buildIdCondition } = require('../lib/queryBuilder');

const BASE_SELECT = 'SELECT id, username, email FROM users WHERE ';

/**
 * Finds users by multiple IDs. TAINT PROPAGATES IN for-of; SINK IS AFTER THE LOOP.
 * In the loop we build the WHERE clause from tainted ids; db.query runs once after.
 * Static analysis must track taint through the for-of (accumulated into whereClause).
 */
async function findByMultipleIds(db, ids) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const conditions = [];

  for (const id of idList) {
    conditions.push(buildIdCondition(id));
  }

  const whereClause = conditions.length ? conditions.join(' OR ') : '1=0';
  const query = BASE_SELECT + whereClause;
  const r = await db.query(query);
  return r.rows;
}

/**
 * Finds users by dynamic filters. TAINT PROPAGATES IN for-in; SINK IS AFTER THE LOOP.
 * In the loop we build the WHERE clause from tainted key/value; db.query runs once after.
 * Static analysis must track taint through the for-in (accumulated into whereClause).
 */
async function findByFilters(db, filters) {
  const obj = typeof filters === 'object' && filters !== null ? filters : {};
  const conditions = [];

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    conditions.push(buildCondition(key, value));
  }

  const whereClause = conditions.length ? conditions.join(' AND ') : '1=1';
  const query = BASE_SELECT + whereClause;
  const r = await db.query(query);
  return r.rows;
}

/**
 * SINK INSIDE for-of LOOP. Taint flows into loop; db.query runs inside the loop.
 * Static analysis must recognize the sink (db.query) inside the for-of.
 */
async function findByMultipleIdsSinkInLoop(db, ids) {
  const results = [];
  const idList = Array.isArray(ids) ? ids : [ids];

  for (const id of idList) {
    const condition = buildIdCondition(id);
    const query = BASE_SELECT + condition;
    const r = await db.query(query);
    results.push(...r.rows);
  }

  return results;
}

/**
 * SINK INSIDE for-in LOOP. Taint flows into loop; db.query runs inside the loop.
 * Static analysis must recognize the sink (db.query) inside the for-in.
 */
async function findByFiltersSinkInLoop(db, filters) {
  const results = [];
  const obj = typeof filters === 'object' && filters !== null ? filters : {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const condition = buildCondition(key, value);
    const query = BASE_SELECT + condition;
    const r = await db.query(query);
    results.push(...r.rows);
  }

  return results;
}

module.exports = {
  findByMultipleIds,
  findByFilters,
  findByMultipleIdsSinkInLoop,
  findByFiltersSinkInLoop,
};
