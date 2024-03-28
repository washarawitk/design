const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser=require('cookie-parser');

const hospitals = require ('./routes/hospitals');
const auth = require('./routes/auth');
//appointment
const appointments=require('./routes/appointments');



dotenv.config({path:'./config/config.env'});

connectDB();
const app=express();

app.use(cookieParser());


app.use(express.json());

app.use('/api/v1/hospitals',hospitals);
app.use('/api/v1/auth',auth);
//appoinement
app.use('/api/v1/appointments',appointments);

const PORT=process.env.PORT || 5100;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'mode on port ', PORT));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});