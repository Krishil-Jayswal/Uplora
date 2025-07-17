interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  installationId: string?;
  token: string;
}

declare namespace Express {
  interface Request {
    user?: User;
  }
}
