const express = require("express");
const cors = require("cors");
const { Pool } = require('pg');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Backend RRHH funcionando"
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    service: 'rh-backend'
  });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as server_time');
    res.json({
      ok: true,
      message: 'Conexión a PostgreSQL exitosa',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error conectando a PostgreSQL',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
