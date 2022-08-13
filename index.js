require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require("./router")
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/DgGramDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(cookieParser());
const corsOption = {
  credentials: true,
  origin: ['http://localhost:3000']
};

app.use(cors(corsOption));
app.use('/storage', express.static('storage'))
// DbConnect();
app.use(bodyParser.json({ limit: '8mb' }));
app.use(express.json());

app.use(router)

app.get('/', (req, res) => {
  res.send('Hello from express.');
});


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`server is runing on ${PORT}`);
})


