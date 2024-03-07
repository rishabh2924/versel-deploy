import express, { NextFunction, Request, Response } from "express"
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes";
import communityRouter from "./routes/communityRoutes";
import roleRouter from "./routes/roleRoutes";
import memberRouter from "./routes/memberRoutes";

export const app= express();

//body parser
app.use(express.json({limit:"50mb"}));

//cookie parser
app.use(cookieParser()) 

//api routes
app.use('/api/v1',userRouter,communityRouter,roleRouter,memberRouter);

//testing api
app.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
})
//