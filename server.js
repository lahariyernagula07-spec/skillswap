const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function readDb() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeDb(db) { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }
function id() { return crypto.randomUUID(); }
function cleanText(value, max = 300) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function notFound(res, message = 'Record not found') { return res.status(404).json({ error: message }); }

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SkillSwap API', timestamp: new Date().toISOString() }));
app.get('/api', (_req, res) => res.json({ name: 'SkillSwap API', version: '1.0.0', endpoints: ['/api/health', '/api/skills', '/api/requests', '/api/messages', '/api/sessions', '/api/profiles'] }));

// Skills: list/search, create, update, delete
app.get('/api/skills', (req, res) => {
  const db = readDb(); const q = cleanText(req.query.q, 100).toLowerCase();
  const category = cleanText(req.query.category, 80).toLowerCase();
  res.json(db.skills.filter(s => (!q || `${s.name} ${s.category} ${s.description} ${s.offeredBy}`.toLowerCase().includes(q)) && (!category || s.category.toLowerCase() === category)));
});
app.post('/api/skills', (req, res) => {
  const name = cleanText(req.body.name, 100); const category = cleanText(req.body.category, 80);
  if (!name || !category) return res.status(400).json({ error: 'name and category are required' });
  const db = readDb(); const item = { id: id(), name, category, description: cleanText(req.body.description, 500), offeredBy: cleanText(req.body.offeredBy, 100) || 'Anonymous student', type: req.body.type === 'wanted' ? 'wanted' : 'offer', createdAt: new Date().toISOString() };
  db.skills.unshift(item); writeDb(db); res.status(201).json(item);
});
app.patch('/api/skills/:id', (req, res) => {
  const db = readDb(); const item = db.skills.find(x => x.id === req.params.id); if (!item) return notFound(res);
  for (const key of ['name','category','description','offeredBy']) if (req.body[key] !== undefined) item[key] = cleanText(req.body[key], key === 'description' ? 500 : 100);
  if (req.body.type === 'offer' || req.body.type === 'wanted') item.type = req.body.type;
  writeDb(db); res.json(item);
});
app.delete('/api/skills/:id', (req, res) => { const db = readDb(); const n = db.skills.length; db.skills = db.skills.filter(x => x.id !== req.params.id); if (n === db.skills.length) return notFound(res); writeDb(db); res.status(204).end(); });

// Exchange requests
app.get('/api/requests', (_req, res) => res.json(readDb().requests));
app.post('/api/requests', (req, res) => {
  const from = cleanText(req.body.from, 100); const skillId = cleanText(req.body.skillId, 100); const message = cleanText(req.body.message, 500);
  if (!from || !skillId) return res.status(400).json({ error: 'from and skillId are required' });
  const db = readDb(); if (!db.skills.some(s => s.id === skillId)) return res.status(400).json({ error: 'skillId does not exist' });
  const item = { id: id(), from, skillId, message, status: 'pending', createdAt: new Date().toISOString() }; db.requests.unshift(item); writeDb(db); res.status(201).json(item);
});
app.patch('/api/requests/:id', (req, res) => { const db = readDb(); const item = db.requests.find(x => x.id === req.params.id); if (!item) return notFound(res); if (!['pending','accepted','declined','completed'].includes(req.body.status)) return res.status(400).json({ error: 'status must be pending, accepted, declined, or completed' }); item.status = req.body.status; writeDb(db); res.json(item); });

// Messages (demo text chat; no real-time delivery)
app.get('/api/messages', (req, res) => { const db = readDb(); const thread = cleanText(req.query.thread, 100); res.json(db.messages.filter(m => !thread || m.thread === thread)); });
app.post('/api/messages', (req, res) => { const sender = cleanText(req.body.sender, 100); const text = cleanText(req.body.text, 2000); const thread = cleanText(req.body.thread, 100) || 'general'; if (!sender || !text) return res.status(400).json({ error: 'sender and text are required' }); const db = readDb(); const item = { id: id(), sender, text, thread, createdAt: new Date().toISOString() }; db.messages.push(item); writeDb(db); res.status(201).json(item); });

// Learning sessions
app.get('/api/sessions', (_req, res) => res.json(readDb().sessions));
app.post('/api/sessions', (req, res) => { const title = cleanText(req.body.title, 120); const student = cleanText(req.body.student, 100); const scheduledAt = cleanText(req.body.scheduledAt, 50); if (!title || !student || !scheduledAt || Number.isNaN(Date.parse(scheduledAt))) return res.status(400).json({ error: 'title, student and valid scheduledAt are required' }); const db = readDb(); const item = { id: id(), title, student, scheduledAt: new Date(scheduledAt).toISOString(), notes: cleanText(req.body.notes, 500), status: 'scheduled', createdAt: new Date().toISOString() }; db.sessions.push(item); writeDb(db); res.status(201).json(item); });
app.patch('/api/sessions/:id', (req, res) => { const db = readDb(); const item = db.sessions.find(x => x.id === req.params.id); if (!item) return notFound(res); if (!['scheduled','completed','cancelled'].includes(req.body.status)) return res.status(400).json({ error: 'status must be scheduled, completed, or cancelled' }); item.status = req.body.status; writeDb(db); res.json(item); });

// Student profiles (demo only; authentication is not included)
app.get('/api/profiles', (_req, res) => res.json(readDb().profiles));
app.post('/api/profiles', (req, res) => { const name = cleanText(req.body.name, 100); const email = cleanText(req.body.email, 200).toLowerCase(); if (!name || !email || !email.includes('@')) return res.status(400).json({ error: 'valid name and email are required' }); const db = readDb(); if (db.profiles.some(p => p.email === email)) return res.status(409).json({ error: 'A profile with this email already exists' }); const item = { id: id(), name, email, department: cleanText(req.body.department, 100), skills: Array.isArray(req.body.skills) ? req.body.skills.map(s => cleanText(s, 60)).filter(Boolean).slice(0, 30) : [], createdAt: new Date().toISOString() }; db.profiles.push(item); writeDb(db); res.status(201).json(item); });

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
app.listen(PORT, () => console.log(`SkillSwap server running at http://localhost:${PORT}`));
