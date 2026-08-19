export interface AuthDto {
  userId: string;
  username: string;
  name: string;
  email: string;
  type: string;
  image?: string;
  token: string;
}
