const express = require("express");
const { body, param, validationResult } = require("express-validator");
const pool = require("../db");

const router = express.Router();

router.post(
  "/",
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
    body("department_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("department_id debe ser un entero positivo"),
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
      const { full_name, email, position, department_id, salary } = req.body;

      const result = await pool.query(
        `INSERT INTO employees (full_name, email, position, department_id, salary)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [full_name, email, position, department_id || null, salary]
      );

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

router.get("/", async (req, res) => {
  try {
    const { department_id } = req.query;

    let query = `
      SELECT
        e.id,
        e.full_name,
        e.email,
        e.position,
        e.salary,
        e.created_at,
        e.department_id,
        d.name AS department_name
      FROM employees e
      LEFT JOIN departments d
        ON e.department_id = d.id
    `;

    const values = [];

    if (department_id) {
      query += ` WHERE e.department_id = $1`;
      values.push(department_id);
    }

    query += ` ORDER BY e.id DESC`;

    const result = await pool.query(query, values);

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


    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT
           e.id,
           e.full_name,
           e.email,
           e.position,
           e.salary,
           e.created_at,
           e.department_id,
           d.name AS department_name
         FROM employees e
         LEFT JOIN departments d
           ON e.department_id = d.id
         WHERE e.id = $1`,
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

router.put(
  "/:id",
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
    body("department_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("department_id debe ser un entero positivo"),
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
      const { full_name, email, position, department_id, salary } = req.body;

      const result = await pool.query(
        `UPDATE employees
         SET full_name = $1,
             email = $2,
             position = $3,
             department_id = $4,
             salary = $5
         WHERE id = $6
         RETURNING *`,
        [full_name, email, position, department_id || null, salary, id]
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

module.exports = router;