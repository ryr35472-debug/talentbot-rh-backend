const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
