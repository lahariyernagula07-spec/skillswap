SKILLSWAP - BACKEND-ENABLED PROJECT

REQUIREMENTS
- Node.js 18 or newer (npm is included with Node.js)
- Internet is needed once to install Express.

RUN LOCALLY (Windows)
1. Extract this ZIP to a folder.
2. Install Node.js LTS from https://nodejs.org/ if it is not installed.
3. Open the extracted SkillSwap-Backend-Project folder.
4. In File Explorer, click the address bar, type cmd, and press Enter.
5. Run: npm install
6. Run: npm start
7. Open http://localhost:3000 in your browser.
8. Check the API at http://localhost:3000/api/health and http://localhost:3000/api.
9. Press Ctrl+C in the terminal to stop the server.

API ENDPOINTS
GET    /api/health
GET    /api/skills?q=python
POST   /api/skills             JSON: {"name":"Python","category":"Programming","description":"Basics","offeredBy":"Student A","type":"offer"}
PATCH  /api/skills/:id         JSON fields to update
DELETE /api/skills/:id
GET    /api/requests
POST   /api/requests           JSON: {"from":"Student A","skillId":"skill-1","message":"Would like to exchange skills"}
PATCH  /api/requests/:id       JSON: {"status":"accepted"}
GET    /api/messages?thread=general
POST   /api/messages           JSON: {"sender":"Student A","text":"Hello","thread":"general"}
GET    /api/sessions
POST   /api/sessions           JSON: {"title":"Python study","student":"Student A","scheduledAt":"2026-11-01T10:00:00Z","notes":"Library"}
PATCH  /api/sessions/:id       JSON: {"status":"completed"}
GET    /api/profiles
POST   /api/profiles           JSON: {"name":"Student A","email":"student@example.com","department":"CSE","skills":["Python"]}

DATA STORAGE
Data is stored in data/db.json. Back up this file before resetting or moving the project.

IMPORTANT LIMITATIONS
- This is a learning/demo backend. It stores data in a local JSON file, not a production database.
- Authentication, password management, authorization, email verification, rate limiting, and real-time chat are not implemented.
- Do not put real student personal data into this demo or expose it publicly as-is.
- The cover page's Website Link button still opens the separately hosted frontend. This API is local until deployed, and the existing hosted frontend is not automatically connected to this backend. To integrate them, update its frontend API calls to use the deployed backend URL and configure CORS/authentication before production.


FRONTEND + BACKEND INTEGRATION
------------------------------
Open http://localhost:3000 after running npm start. The homepage now has a Skill Dashboard link.
On dashboard.html, the skill list loads from GET /api/skills, the form saves via POST /api/skills,
and each Request exchange form creates a record via POST /api/requests. Search filters the loaded list.

If you change files, keep the server running and refresh the browser. If you edit server.js, restart it with Ctrl+C and npm start.
The dashboard is served from this same Express server, so it uses relative /api URLs and does not need CORS configuration.
