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

app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        salary NUMERIC(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    res.json({
      ok: true,
      message: 'Tabla employees creada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error creando tabla employees',
      error: error.message
    });
  }
});

app.post('/employees', async (req, res) => {
  try {
    const { full_name, email, position, department, salary } = req.body;

    const query = `
      INSERT INTO employees (full_name, email, position, department, salary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [full_name, email, position, department, salary];
    const result = await pool.query(query, values);

    res.status(201).json({
      ok: true,
      employee: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error creando empleado',
      error: error.message
    });
  }
});

app.get('/employees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM employees
      ORDER BY id DESC
    `);

    res.json({
      ok: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error listando empleados',
      error: error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
