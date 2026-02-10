
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/avenue';
const isCloudDB = connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  ...(isCloudDB && { ssl: { rejectUnauthorized: false } })
});

pool.query(`
  CREATE TABLE IF NOT EXISTS avenue_data (
      id VARCHAR(255) PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_entity_type ON avenue_data(entity_type);
`).then(() => {
  console.log(`Database table verified.`);
}).catch(err => {
  console.error("Failed to initialize database table:", err);
});

app.get('/api/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, entity_type, data FROM avenue_data');
    const result = { users: [], customers: [], trips: [], bookings: [], finance: [] };
    rows.forEach(row => {
      if (result[row.entity_type]) {
        result[row.entity_type].push({ id: row.id, ...row.data });
      }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:type', async (req, res) => {
  const { type } = req.params;
  const { id, ...data } = req.body;
  if (!id) return res.status(400).json({ error: "Missing entity ID" });

  try {
    await pool.query(
      `INSERT INTO avenue_data (id, entity_type, data) 
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE 
       SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
      [id, type, data]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    await pool.query('DELETE FROM avenue_data WHERE id = $1 AND entity_type = $2', [id, type]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server locally if not running inside Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===========================================================`);
    console.log(`Avenue Backend API is running!`);
    console.log(`Listening on port: ${PORT}`);
    console.log(`===========================================================`);
  });
}

// Export the app so Vercel can run it as a serverless function
module.exports = app;
