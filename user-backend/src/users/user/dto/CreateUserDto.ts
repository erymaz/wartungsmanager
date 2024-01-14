export interface CreateUserDto {
  name: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  image: string | null;
}
