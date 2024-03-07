import { Request } from "express";
import { IUser } from "../models/userModal";

//Extends the Express Request interface by adding an optional 'user' property of type IUser.
declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }
    
      
     
    
}