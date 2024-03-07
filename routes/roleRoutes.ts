import express from 'express'
import { createRole, getAllRoles } from '../controllers/roleControllers'

const roleRouter=express.Router()

//routes
//create role
roleRouter.post('/role',createRole)

//get all roles
roleRouter.get('/role',getAllRoles)


export default roleRouter