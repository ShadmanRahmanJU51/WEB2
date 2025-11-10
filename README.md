Task Management API
===================


Setup Instructions
------------------
1. git clone https://github.com/ShadmanRahmanJU51/web2.git
2. cd web2
3. git checkout features/routes
4. npm install
5. npm start

Server runs at: http://localhost:3000


API Endpoint List
-----------------
GET /                 → Returns welcome message
GET /health           → Returns { "status": "healthy", "uptime": ... }
GET /tasks            → Returns list of 5 tasks
GET /tasks/:id        → Returns single task by ID
GET /task/:id         → (same as above - backward compatible)
GET /tasks/abc        → Returns 400 error (Invalid ID format)
GET /tasks/999        → Returns 404 error (Task not found)

All 7 assignments completed on branch: features/routes