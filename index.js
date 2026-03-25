const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const employeeRoutes = require("./routes/employees");
const departmentRoutes = require("./routes/departments");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

app.use("/employees", employeeRoutes);
app.use("/departments", departmentRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});