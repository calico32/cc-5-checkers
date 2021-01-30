import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { resolve } from 'path';

export const app: express.Application = express();

process.env.NODE_ENV === 'development'
  ? // dev only - allow requests from snowpack dev server
    app.use(cors())
  : // serve built files
    app.use(express.static(resolve(__dirname, '../../frontend/build')));

// logging
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '../../frontend/build/index.html'));
});

app.get('*', (req, res) => {
  res.status(404).sendFile(resolve(__dirname, '../../frontend/build/notfound.html'));
});
