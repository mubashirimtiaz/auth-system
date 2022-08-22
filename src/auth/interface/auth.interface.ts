export interface JwtTOKEN {
  iat: number;
  exp: number;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}
