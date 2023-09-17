import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import ServiceRoute from "./routes/ServiceRoute.js"
import cors from 'cors';
import path from "path";

//env config
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname,'./client/built')))

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/service", ServiceRoute);

//rest api
app.use('*',function(req,res){
res.sendFile(path.join(__dirname, "./client/build/index.html"))
})

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT,()=>{
    console.log(`Server Running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white)
})
