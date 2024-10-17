const express = require("express");
const visit = require("./visit.js");
const { config } = require("dotenv");
config();

const app = express();

app.get("/", (_, res) => res.send("Express on Vercel"));
app.get("/api/visit", visit);

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
