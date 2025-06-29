interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  installation_id: string?;
  token: string;
}

declare namespace Express {
  interface Request {
    user?: User;
  }
}
