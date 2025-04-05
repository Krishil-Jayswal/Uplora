interface User {
    id: string;
    token: string;
}

declare namespace Express {
    interface Request {
        user?: User
    }
}
