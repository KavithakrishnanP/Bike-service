import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () =>{
    try{
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to MongoDB ${connect.connection.host}`.bgGreen.white)
    }catch (error){
        console.log(`Error in Mongodb ${error}`.bgRed.white)
    }
    }

    export default connectDB;