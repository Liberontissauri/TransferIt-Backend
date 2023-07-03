import express from "express"
import passport from "passport"
import {Strategy as LocalStrategy, VerifyFunction} from "passport-local"
import UserModel from "./models/User"
import bcrypt from "bcrypt"
import UserFileModel from "./models/User_File"
import { getStorageFromFileList } from "./utils/files"

const verify: VerifyFunction = async function verify(usernameOrEmail, password, done) {
    let user = await UserModel.getUserByUsername(usernameOrEmail)
    if (!user) {    
        user = await UserModel.getUserByEmail(usernameOrEmail)
        if (!user) return done(null, false)
    }
    const passwordMatches = await bcrypt.compare(password, user.hash)
    if (passwordMatches) return done(null, user)
    return done(null, false)
}
passport.use(new LocalStrategy(verify))

passport.serializeUser((user: any, done: Function) => {
    process.nextTick(() => {
        done(null, { id: user.id, username: user.username });
    });
})
passport.deserializeUser((user: any, done: Function) => {
    process.nextTick(async () => {
        const full_user = await UserModel.getUserById(user.id)
        const user_files = await UserFileModel.getFilesFromUser(user.id)
        const used_storage = await getStorageFromFileList(user_files)
        return done(null, {...full_user, used_storage});
    });
});

const router = express.Router()

router.post("/signup", async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    const SALT_ROUNDS = 10
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hash = await bcrypt.hash(password, salt)

    UserModel.createUser(username, hash, email)

    res.status(200).json({
        message: "User created successfully"
    })
})
router.post("/login", passport.authenticate("local", {failureMessage: true}), (req, res) => {
    if(!process.env["POST_LOGIN_URL"]) return res.status(500).send({message: "POST_LOGIN_URL not set"})
    return res.send({message: "Login successful", redirect: process.env["POST_LOGIN_URL"]})
})
router.post("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) { return next(err); }
        return res.redirect("/")
    })
})


module.exports = router