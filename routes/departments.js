const express = require("express");
const { body, param, validationResult } = require("express-validator");
const pool = require("../db");

const router = express.Router();

async function ensureDepartmentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .withMessage("name es obligatorio")
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
      await ensureDepartmentsTable();

      const { name, description } = req.body;

      const result = await pool.query(
        `INSERT INTO departments (name, description)
         VALUES ($1, $2)
         RETURNING *`,
        [name, description]
      );

      res.status(201).json({
        ok: true,
        department: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error creando departamento",
        error: error.message
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    await ensureDepartmentsTable();

    const result = await pool.query(`
      SELECT * FROM departments
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
      message: "Error listando departamentos",
      error: error.message
    });
  }
});

router.get(
  "/:id",
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
      await ensureDepartmentsTable();

      const { id } = req.params;

      const result = await pool.query(
        "SELECT * FROM departments WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Departamento no encontrado"
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
        message: "Error obteniendo departamento",
        error: error.message
      });
    }
  }
);

router.put(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("id debe ser un entero positivo"),
    body("name")
      .notEmpty()
      .withMessage("name es obligatorio")
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
      await ensureDepartmentsTable();

      const { id } = req.params;
      const { name, description } = req.body;

      const result = await pool.query(
        `UPDATE departments
         SET name = $1,
             description = $2
         WHERE id = $3
         RETURNING *`,
        [name, description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Departamento no encontrado"
        });
      }

      res.json({
        ok: true,
        department: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error actualizando departamento",
        error: error.message
      });
    }
  }
);

router.delete(
  "/:id",
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
      await ensureDepartmentsTable();

      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM departments WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "Departamento no encontrado"
        });
      }

      res.json({
        ok: true,
        message: "Departamento eliminado correctamente",
        department: result.rows[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        message: "Error eliminando departamento",
        error: error.message
      });
    }
  }
);

module.exports = router;