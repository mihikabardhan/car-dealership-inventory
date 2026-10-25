# AutoHub: Car Dealership Inventory System

Full-stack app for the TDD Kata. Customers can browse, search and buy cars. Admins can add, edit, delete and restock vehicles.

## Tech stack
- Backend: Node.js, TypeScript, Express, SQLite (better-sqlite3), JWT, bcryptjs
- Tests: Jest + Supertest
- Frontend: React (Vite) + Tailwind CSS

## How to run locally
Requires Node 18+.

**Backend**
```bash
cd backend
npm install
cp .env.example .env     # set JWT_SECRET to any long random string
npm run seed             # creates the admin user and sample cars
npm run dev              # http://localhost:4000
```

**Frontend** (second terminal)
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

**Admin login:** `admin@dealership.com` / `admin123`. Register on the sign-up page for a normal user.

## API
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/vehicles, /api/vehicles/search | logged in |
| POST | /api/vehicles | logged in |
| PUT | /api/vehicles/:id | logged in |
| DELETE | /api/vehicles/:id | admin |
| POST | /api/vehicles/:id/purchase | logged in |
| POST | /api/vehicles/:id/restock | admin |

## Design notes
- Routes only handle HTTP; services hold the logic and validation.
- `createApp(db)` takes the database as a parameter so tests use their own database file.
- Purchase is a single `UPDATE ... WHERE quantity >= ?`, so two buyers cannot take the last car.
- Admins cannot be created through the API (seed script only), to prevent privilege escalation.
- All SQL uses `?` placeholders.
- Known limits: token stored in localStorage, no pagination, no frontend tests.

## Screenshots
![Login](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Admin view](screenshots/admin.png)

## My AI Usage
**Tools:** Claude (Anthropic).

**How I used it:** Claude suggested the stack and project structure and drafted the auth, vehicle CRUD, search, server/seed code and the React frontend. For the inventory feature I wrote the purchase/restock tests myself from written rules, wrote the purchase/restock code with hints from Claude, and did the validation refactor in small steps, running the tests after each one. I ran the app and tested login, search, purchase and admin actions in the browser. Commits where Claude helped carry a Co-authored-by trailer.

**Reflection:** AI saved a lot of time on boilerplate and made it easy to follow red-green-refactor. It also handed me code I had to read before I could explain it, so I went through each file and the concepts (JWT, bcrypt, 401 vs 403, SQL injection, race conditions) to be able to discuss them. Writing the inventory tests and code myself taught me more than reading generated code.

## Test report
```bash
cd backend && npm test        # or: npm run coverage
```
```

> backend@1.0.0 coverage
> jest --runInBand --coverage

PASS tests/vehicles.test.ts
PASS tests/auth.test.ts
PASS tests/inventory.test.ts
PASS tests/search.test.ts
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   96.72 |     93.4 |     100 |    97.2 |                   
 src                |   93.33 |       50 |     100 |   93.33 |                   
  app.ts            |    90.9 |       50 |     100 |    90.9 | 29-30             
  db.ts             |     100 |      100 |     100 |     100 |                   
  types.ts          |     100 |      100 |     100 |     100 |                   
 src/middleware     |     100 |      100 |     100 |     100 |                   
  auth.ts           |     100 |      100 |     100 |     100 |                   
 src/routes         |   97.77 |       75 |     100 |   97.72 |                   
  auth.ts           |     100 |      100 |     100 |     100 |                   
  vehicles.ts       |   96.87 |       75 |     100 |   96.77 | 10                
 src/services       |    96.8 |    94.93 |     100 |    97.8 |                   
  userService.ts    |   95.83 |    94.44 |     100 |   95.83 | 35                
  vehicleService.ts |   97.14 |    95.08 |     100 |    98.5 | 16                
--------------------|---------|----------|---------|---------|-------------------

Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        4.187 s
Ran all test suites
```
