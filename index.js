const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { body, param, validationResult } = require("express-validator");
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

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    service: "rh-backend"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as server_time");
    res.json({
      ok: true,
      message: "Conexión a PostgreSQL exitosa",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error conectando a PostgreSQL",
      error: error.message
    });
  }
});

app.post(
  "/employees",
  [
    body("full_name")
      .notEmpty()
      .withMessage("full_name es obligatorio"),
    body("email")
      .isEmail()
      .withMessage("email inválido"),
    body("position")
      .notEmpty()
      .withMessage("position es obligatorio"),
    body("salary")
      .optional()
      .isNumeric()
      .withMessage("salary debe ser numérico")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array()
      });
    }

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
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error creando empleado",
        error: error.message
      });
    }
  }
);

app.get("/employees", async (req, res) => {
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
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error listando empleados",
      error: error.message
    });
  }
});

app.get(
  "/employees/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("id debe ser un entero positivo")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array()
      });
    }

    try {
      const { id } = req.params;

      const result = await pool.query(
        "SELECT * FROM employees WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Empleado no encontrado"
        });
      }

      res.json({
        ok: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error obteniendo empleado",
        error: error.message
      });
    }
  }
);

app.put(
  "/employees/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("id debe ser un entero positivo"),
    body("full_name")
      .notEmpty()
      .withMessage("full_name es obligatorio"),
    body("email")
      .isEmail()
      .withMessage("email inválido"),
    body("position")
      .notEmpty()
      .withMessage("position es obligatorio"),
    body("salary")
      .optional()
      .isNumeric()
      .withMessage("salary debe ser numérico")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array()
      });
    }

    try {
      const { id } = req.params;
      const { full_name, email, position, department, salary } = req.body;

      const result = await pool.query(
        `UPDATE employees
         SET full_name = $1,
             email = $2,
             position = $3,
             department = $4,
             salary = $5
         WHERE id = $6
         RETURNING *`,
        [full_name, email, position, department, salary, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Empleado no encontrado"
        });
      }

      res.json({
        ok: true,
        employee: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error actualizando empleado",
        error: error.message
      });
    }
  }
);

app.delete(
  "/employees/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("id debe ser un entero positivo")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array()
      });
    }

    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM employees WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Empleado no encontrado"
        });
      }

      res.json({
        ok: true,
        message: "Empleado eliminado correctamente",
        employee: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error eliminando empleado",
        error: error.message
      });
    }
  }
);

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 3000}`);
});
