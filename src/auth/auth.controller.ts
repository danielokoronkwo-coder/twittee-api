/* eslint-disable */
import { Controller, Request, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { HttpCode } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) { }

    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto)
    }


    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    @Post('login')
    async login(@Request() req) {
        const { user } = req;
        const refreshToken = await this.authService.getRefreshTokenCookie(user.id)
        req.res.setHeader('Set-Cookie', refreshToken)
        return await this.authService.login(req.user);

    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}