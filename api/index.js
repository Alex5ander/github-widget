import express from 'express';
import visit from './visit.js';

const app = express();

app.get("/", (_, res) => res.send("Express on Vercel"));
app.get('/api/visit', visit);

app.listen(3000, () => console.log("Server ready on port 3000."));

export default app;