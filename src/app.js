const express = require("express");
const cors = require("cors");
const dns = require("dns");

const app = express();

app.use(
  cors({
    origin: ["https://sycchat.netlify.app", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.get("/", (req, res) => {
  res.send("SyncChat Backend Running...");
});

module.exports = app;