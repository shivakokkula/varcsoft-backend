const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const authLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/error');
const authRoutes = require("./routes/auth.routes");
const draftRoutes = require("./routes/draft.routes");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// limit repeated failed requests to auth endpoints
app.use('/login', authLimiter);

app.use("/", authRoutes);
app.use("/draft", draftRoutes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(Error('Not found'));
});

// handle error
app.use(errorHandler);

let server;
let PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DB,{useNewUrlParser: true,useUnifiedTopology: true,}).then(()=>{
    console.log("Database connected");
    server = app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(e => console.log(e));

mongoose.connection.on('disconnected', function () {
    console.log("Mongoose default connection is disconnected");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
        console.log('Server closed');
        process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
    console.log(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});