import express from 'express';
import { config } from 'dotenv';
config();
import visit from './api/visit.js';
const app = express();

app.listen(3000);
app.get('/api/visit', visit);