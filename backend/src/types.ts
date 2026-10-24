export type Role = "user" | "admin";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

// the data we put inside the JWT
export interface TokenPayload {
  id: number;
  email: string;
  role: Role;
}

// lets services throw an error that already knows its http status
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
