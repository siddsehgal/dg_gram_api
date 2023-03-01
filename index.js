import 'dotenv/config';
import express, { json } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import router from './src/routes/index.js';
import MySqlDB from './src/model/index.js';
import GlobalExceptionHandler from './src/controllers/errorController.js';
import ConnectSocket from './src/socket-controller/index.js';

// Initialize Express
const app = express();

// Create Http Server from Express
const httpServer = createServer(app);

// Connect to Socket
ConnectSocket(httpServer);

// MySql Database Connection
await MySqlDB();

// ---- Express Middleware ----
// For Parsing JSON From the Request Body
app.use(json());

// Config for CORS
app.use(
  cors({
    origin: '*',
  })
);

// Setting Logger for Logging all the Incoming Requests
app.use(morgan('tiny'));

// ---- ROUTES ----
// Root Path for Testing
app.get('/', (req, res) => {
  res.status(200).send('Dg Gram API Running...');
});

// Base Path for APIs
app.use('/api', router);

// Handling Exception
app.use(GlobalExceptionHandler);

// Defining Port and Listening
const PORT = process.env.PORT || 5500;

// Listening to PORT
httpServer.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
