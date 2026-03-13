# SQL Injection (Subtle, Multi-Layer, Loops)

Node.js app with **subtle** SQL injection across **multiple layers** and **two loop patterns** for static analysis:

1. **Taint propagation inside loop** – taint flows/accumulates in the loop; **sink after** the loop.
2. **Sink inside loop** – **sink** (`db.query`) is **inside** the for-loop (for-of and for-in).

## Layers (taint flow)

1. **Routes** – `req.body.ids` / `req.body.filters` (source)
2. **Services** – pass-through to repository
3. **Repository** – either (A) accumulate in loop then sink after, or (B) sink inside loop
4. **Query builder** – `buildCondition(column, value)` / `buildIdCondition(id)` – string concatenation (no parameterization)

---

## Case 1: Taint propagation inside loop (sink after loop)

Taint propagates inside the loop (e.g. into a `conditions` array); a single `db.query(...)` runs **after** the loop using the accumulated value.

| Endpoint | Loop | Flow |
|----------|------|------|
| **POST /users/by-ids** | for-of | In loop: `conditions.push(buildIdCondition(id))`. After loop: `db.query(BASE_SELECT + conditions.join(' OR '))`. |
| **POST /users/by-filters** | for-in | In loop: `conditions.push(buildCondition(key, value))`. After loop: `db.query(BASE_SELECT + conditions.join(' AND '))`. |

Static analysis must: track taint through the loop into the accumulated value, then to the sink **after** the loop.

---

## Case 2: Sink inside loop

The sink (`db.query`) is invoked **inside** the for-loop; taint flows into the loop and each iteration may execute a tainted query.

| Endpoint | Loop | Flow |
|----------|------|------|
| **POST /users/by-ids-sink-in-loop** | for-of | **Inside** `for (const id of idList)`: `db.query(BASE_SELECT + buildIdCondition(id))`. |
| **POST /users/by-filters-sink-in-loop** | for-in | **Inside** `for (const key in obj)`: `db.query(BASE_SELECT + buildCondition(key, value))`. |

Static analysis must: recognize the sink **inside** the for-of / for-in and relate it to the tainted loop variable.

## Setup

```bash
cp .env.example .env
# Edit .env if needed (DB_*)
npm install
npm run migrate
npm start
```

## Example requests

```bash
# Case 1: taint in loop, sink after
curl -s -X POST http://localhost:3080/users/by-ids -H "Content-Type: application/json" -d '{"ids":[1,2]}'
curl -s -X POST http://localhost:3080/users/by-ids -H "Content-Type: application/json" -d '{"ids":["1 OR 1=1"]}'
curl -s -X POST http://localhost:3080/users/by-filters -H "Content-Type: application/json" -d '{"filters":{"username":"admin"}}'
curl -s -X POST http://localhost:3080/users/by-filters -H "Content-Type: application/json" -d '{"filters":{"username":"admin'\'' OR '\''1'\''='\''1"}}'

# Case 2: sink inside loop
curl -s -X POST http://localhost:3080/users/by-ids-sink-in-loop -H "Content-Type: application/json" -d '{"ids":[1]}'
curl -s -X POST http://localhost:3080/users/by-ids-sink-in-loop -H "Content-Type: application/json" -d '{"ids":["1 OR 1=1"]}'
curl -s -X POST http://localhost:3080/users/by-filters-sink-in-loop -H "Content-Type: application/json" -d '{"filters":{"username":"admin"}}'
curl -s -X POST http://localhost:3080/users/by-filters-sink-in-loop -H "Content-Type: application/json" -d '{"filters":{"username":"admin'\'' OR '\''1'\''='\''1"}}'
```
