import express from 'express';
import { config } from 'dotenv';
import visit from './visit.js';
config();

const app = express();

app.get("/", (_, res) => res.send("Express on Vercel"));
app.get('/api/visit', visit);

app.listen(80, () => console.log("Server ready on port 3000."));

export default app;