import express from 'express';
import { register } from 'module';
import { getUserInfo, loginUser, registerUser } from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

const userRouter = express.Router();

//routes 

//register user
userRouter.post('/auth/signup',registerUser)

//login user
userRouter.post('/auth/signin',loginUser)

//get user
userRouter.get('/auth/me',isAuthenticated,getUserInfo)

export default userRouter

