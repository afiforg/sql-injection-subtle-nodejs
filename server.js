require('dotenv').config();
const express = require('express');
const { getPool, initSchema } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

async function main() {
  if (process.argv[2] === 'migrate') {
    const pool = await getPool();
    const client = await pool.connect();
    await initSchema(client);
    client.release();
    await pool.end();
    console.log('Migrations done.');
    process.exit(0);
    return;
  }

  const pool = await getPool();
  await initSchema(pool);

  app.locals.db = pool;

  app.post('/users/by-ids', userRoutes.byIdsHandler);
  app.post('/users/by-filters', userRoutes.byFiltersHandler);
  app.post('/users/by-ids-sink-in-loop', userRoutes.byIdsSinkInLoopHandler);
  app.post('/users/by-filters-sink-in-loop', userRoutes.byFiltersSinkInLoopHandler);

  const port = parseInt(process.env.PORT || '3080', 10);
  app.listen(port, () => {
    console.log('sql-injection-subtle-nodejs listening on port', port);
    console.log('  [taint in loop, sink after]');
    console.log('    POST /users/by-ids   body: { "ids": [1, 2] }');
    console.log('    POST /users/by-filters body: { "filters": { "username": "admin" } }');
    console.log('  [sink inside loop]');
    console.log('    POST /users/by-ids-sink-in-loop   body: { "ids": [1, 2] }');
    console.log('    POST /users/by-filters-sink-in-loop body: { "filters": { "username": "admin" } }');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
