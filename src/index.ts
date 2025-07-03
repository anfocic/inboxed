import express from 'express';
import formRoute from './routes/form.routes';
import rateLimiter from "./middleware/rateLimiter";
import cors from "./middleware/cors";
import { config } from './utils/env';
import { logger } from './utils/logger';

const app = express();

app.use(cors);
app.use(rateLimiter);
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Welcome to FormBridge!');
});

app.use('/api/form', formRoute);

app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
    logger.log(`🚀 Server running at http://localhost:${config.port}`);
});
