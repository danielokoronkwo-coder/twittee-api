/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
        private jwtService: JwtService
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        try {
            const user = await this.usersService.findUserByUsername(username);
            const isPasswordMatch = await this.verifyPassword(password, user.password);

            if (user && isPasswordMatch) {
                const { password, ...result } = user;
                return result;
            }
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        const refreshToken = await this.getRefreshTokenCookie(user.id);
        await this.usersService.setCurrentRefreshToken(refreshToken, user.id);
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
            user
        };
    }

    async register(createUserDto: CreateUserDto) {
        const newUser = await this.usersService.register(createUserDto);
        return newUser;
    }

    async getRefreshTokenCookie(userId: number): Promise<string> {
        const payload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRY')}s`
        })
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRY')}s`;

        return cookie;
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
        
        return isPasswordMatching;
    }
}