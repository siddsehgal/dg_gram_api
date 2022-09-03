import 'dotenv/config';
import express, { json } from 'express';
const app = express();
import cors from 'cors';
import router from './src/routes/index.js';
import cookieParser from 'cookie-parser';
import DB from './model/index.js';
import GlobalExceptionHandler from './src/controllers/errorController.js';

app.use(cookieParser());
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'],
};

app.use(cors(corsOption));

await DB();
// app.use(bodyParser.json({ limit: '8mb' }));
app.use(json());

app.get('/', (req, res) => {
    res.send('Hello from express.');
});

app.use('/api', router);
app.use(GlobalExceptionHandler);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`server is runing on ${PORT}`);
});
