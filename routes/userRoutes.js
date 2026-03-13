const userService = require('../services/userService');

function normalizeIds(body) {
  if (!body || typeof body !== 'object') return [];
  const raw = body.ids;
  if (Array.isArray(raw)) return raw.map((x) => (typeof x === 'number' ? x : String(x)));
  if (raw !== undefined && raw !== null) return [typeof raw === 'number' ? raw : String(raw)];
  return [];
}

function normalizeFilters(body) {
  if (!body || typeof body !== 'object') return {};
  const raw = body.filters;
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const out = {};
    for (const k in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, k)) {
        out[k] = raw[k] == null ? '' : String(raw[k]);
      }
    }
    return out;
  }
  return {};
}

async function byIdsHandler(req, res) {
  const db = req.app.locals.db;
  const ids = normalizeIds(req.body);
  try {
    const users = await userService.getUsersByIds(db, ids);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function byFiltersHandler(req, res) {
  const db = req.app.locals.db;
  const filters = normalizeFilters(req.body);
  try {
    const users = await userService.getUsersByFilters(db, filters);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function byIdsSinkInLoopHandler(req, res) {
  const db = req.app.locals.db;
  const ids = normalizeIds(req.body);
  try {
    const users = await userService.getUsersByIdsSinkInLoop(db, ids);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function byFiltersSinkInLoopHandler(req, res) {
  const db = req.app.locals.db;
  const filters = normalizeFilters(req.body);
  try {
    const users = await userService.getUsersByFiltersSinkInLoop(db, filters);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  byIdsHandler,
  byFiltersHandler,
  byIdsSinkInLoopHandler,
  byFiltersSinkInLoopHandler,
};
