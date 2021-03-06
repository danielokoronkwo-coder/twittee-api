/* eslint-disable */
import { Controller, Request, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { HttpCode } from '@nestjs/common';
import { TokenPayload } from './token-payload';

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
    async login(@Request() request) {
        const { user } = request;
        const refreshToken = await this.authService.getRefreshTokenCookie(user.id)
        request.res.setHeader('Set-Cookie', refreshToken)
        return await this.authService.login(request.user);

    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Get('profile')
    getProfile(@Request() request) {
        return request.user;
    }
    
    @HttpCode(200)
    @Post('refresh')
    async refresh(@Body() tokenPayload: TokenPayload) {
        return await this.authService.getNewRefreshToken(tokenPayload.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @Post('logout')
    async logout(@Request() request)  {
        console.log(request.user)
    }
}