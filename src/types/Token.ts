import { User } from "./Auth";

export interface Token {
  id: number;
  token: string;
  issuedAt: string;
  expireAt: string;
  blacklisted: boolean;
  user: User;
}
