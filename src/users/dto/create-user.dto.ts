/* eslint-disable */
export class CreateUserDto {
    readonly firstname: string;
    readonly lastname: string;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly refreshToken?: string
}
