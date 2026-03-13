/**
 * Builds a single SQL condition fragment. Used by repository layer.
 * VULNERABLE: Concatenates user-controlled column and value into SQL.
 * Static analysis must follow taint through service → repository → here.
 */
function buildCondition(column, value) {
  if (value === undefined || value === null) return '1=1';
  return `${column} = '${value}'`;
}

/**
 * Builds WHERE clause for numeric id (no quotes). Used in for-of path.
 * VULNERABLE: Direct interpolation of user-controlled value.
 */
function buildIdCondition(id) {
  return `id = ${id}`;
}

module.exports = { buildCondition, buildIdCondition };
