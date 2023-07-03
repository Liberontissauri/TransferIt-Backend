require("dotenv").config()
import logger from "./logs"
const PORT = process.env.PORT || 3001

import express from "express"

const app = express()
import cors from "cors"

if (!process.env["MAIN_DOMAIN_URL"]) throw Error("No \"MAIN_DOMAIN_URL\" environment variable provided")

app.use(cors({
    origin: process.env["MAIN_DOMAIN_URL"],
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

import passport from "passport"

import redis from "./db/redis_init"
import RedisStore from "connect-redis"
import session from "express-session"

if (!process.env["DATABASE_URL"]) throw Error("No \"DATABASE_URL\" environment variable provided")
if (!process.env["SESSION_SECRET"]) throw Error("No \"SESSION_SECRET\" environment variable provided")

import objection from "objection"
import { User } from "./schemas/user"
import knex_instance from "./db/pg_init"

objection.Model.knex(knex_instance)
logger.info("DB Initialized")

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({
        client: redis,
        prefix: "session:"
    })
}))
app.use(passport.session())
logger.info("Session Initialized")
app.use("/api/auth/", require("./auth"))
logger.info("Auth Initialized")
app.use("/api/files/", require("./files"))
logger.info("Files Initialized")

app.get("/api/profile", (req:any, res) => {
    if(!req.user) {
        logger.warn("/api/profile GET attempt, but not logged in")
    
        return res.status(401).send({
            message: "not logged in"
        })
    }
    
    const user:User = User.parse(req.user)
    
    logger.debug(`User ${user.id} requested their profile successfully`)
    return res.send({
        username: user.username,
        email: user.email,
        storage_limit: user.storage_limit,
        created_at: user.created_at,
        updated_at: user.created_at
    })

})



app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`)
})