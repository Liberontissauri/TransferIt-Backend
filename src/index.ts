require("dotenv").config()
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

import { Redis } from "ioredis"
const redis = new Redis(process.env.SESSION_REDIS_DB_URL || "redis://127.0.0.1:6379");
import RedisStore from "connect-redis"
import session from "express-session"

if (!process.env["DATABASE_URL"]) throw Error("No \"DATABASE_URL\" environment variable provided")
if (!process.env["SESSION_SECRET"]) throw Error("No \"SESSION_SECRET\" environment variable provided")

import knex from "knex"
import objection from "objection"

objection.Model.knex(knex({
    client: "pg",
    connection: process.env["DATABASE_URL"]
}))

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
app.use("/api/auth/", require("./auth"))
app.use("/api/files/", require("./files"))

app.get("/api/profile", (req, res) => {
    const user:any = req.user
    if(user) return res.send({
        username: user.username,
        email: user.email,
        storage_limit: user.storage_limit,
        created_at: user.created_at,
        updated_at: user.created_at
    })
    
    return res.status(401).send({
        message: "not logged in"
    })
})



app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`)
})