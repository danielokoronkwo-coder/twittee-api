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
        return {
            access_token: this.jwtService.sign(payload, {
                
            }),
            user
        };
    }

    async register(createUserDto: CreateUserDto) {
        const newUser = await this.usersService.register(createUserDto);
        return newUser;
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
        
        return isPasswordMatching;
    }
}