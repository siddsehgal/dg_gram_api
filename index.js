import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import router from './src/routes/index.js';
import cookieParser from 'cookie-parser';
import MySqlDB from './model/index.js';
import GlobalExceptionHandler from './src/controllers/errorController.js';
import ConnectSocket from './src/socket-controller/index.js';
const app = express();

// app.use(cookieParser());

const corsOption = {
  credentials: true,
  origin: '*',
};
app.use(cors(corsOption));
app.use(express.json({ urlEncoded: true }));

ConnectSocket();
await MySqlDB();

app.use(json());

app.get('/', (req, res) => {
  res.send('Hello from express.');
});

app.use('/api', router);
app.use(GlobalExceptionHandler);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
