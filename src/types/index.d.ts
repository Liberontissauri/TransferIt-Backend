import { User } from "../schemas/user"

interface IUser {
    id: string,
    name: string
}

declare namespace Express {
    interface Request {
        user: IUser
    }
}
