
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Enable CORS so the frontend can communicate with the backend
app.use(cors());
app.use(express.json());

// Railway and most cloud databases require SSL. 
// We enable SSL if a DATABASE_URL is provided (which Railway does automatically) and it's not localhost.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/avenue';
const isCloudDB = connectionString && !connectionString.includes('localhost');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: connectionString,
  ...(isCloudDB && { ssl: { rejectUnauthorized: false } })
});

// Auto-initialize the database table
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
  console.log(`Database table verified. (SSL Enabled: ${!!isCloudDB})`);
}).catch(err => {
  console.error("Failed to initialize database table:", err);
});

// GET: Retrieve all system data grouped by entity type
app.get('/api/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, entity_type, data FROM avenue_data');
    
    // Group rows by their entity collections
    const result = {
      users: [],
      customers: [],
      trips: [],
      bookings: [],
      finance: []
    };

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

// POST: Create or Update an entity (Upsert)
app.post('/api/data/:type', async (req, res) => {
  const { type } = req.params;
  const { id, ...data } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: "Missing entity ID" });
  }

  try {
    // Insert new row, or update existing row if 'id' already exists
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

// DELETE: Remove an entity
app.delete('/api/data/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    await pool.query('DELETE FROM avenue_data WHERE id = $1 AND entity_type = $2', [id, type]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Avenue Backend API is running on port ${PORT}`);
});
