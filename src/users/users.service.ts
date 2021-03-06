/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ResponseWrapper } from 'src/utils/ResponseWrapper';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService
  ) { }
  
  async register(createUserDto: CreateUserDto): Promise<ResponseWrapper> {

    const password = await bcrypt.hash(createUserDto.password, parseInt(this.configService.get('SALT')));
    const newUser = this.usersRepository.create({ ...createUserDto, password });
    const user = await this.usersRepository.save(newUser);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      error: false,
      data: this.destructureResponse(user)
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.usersRepository.find();
      return users;
    } catch (error) {
      throw error;
    } 
  }

  findOne(id: number) {
    try {
      const user = this.usersRepository.findOneOrFail(id)
      return user;
    } catch (error) {
      throw error;
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async findUserByUsername(username: any) {
    try {
      const users = await this.usersRepository.find();
      const user = users.find(user => user.username == username)
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, parseInt(this.configService.get('SALT')));
    await this.usersRepository.update(userId, {
      hashedRefreshToken: currentHashedRefreshToken
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.findOne(userId);
 
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    );
 
    if (isRefreshTokenMatching) {
      return user;
    }
  }
  
  private destructureResponse(response: User): Object {
    const { id, firstname, lastname, username, email } = response;
    return { id, firstname, lastname, username, email }
  }

}
