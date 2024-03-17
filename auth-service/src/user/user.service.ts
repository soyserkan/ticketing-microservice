import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { SignUpDto } from './dto/signup.dto';
import { Config } from 'src/config/app.config';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { ErrorCodes, JwtServicePayload } from '@ssticketmicroservice/common';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private jwtService: JwtService) {}

  async signUp({ name, surname, email, password }: SignUpDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new HttpException(ErrorCodes.USER_ALREADY_REGISTERED, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, Config.bcryptSalt);

    const createUser = this.userRepository.create({
      name,
      surname,
      password: hashedPassword,
      email,
    });
    await this.userRepository.save(createUser);

    const payload: JwtServicePayload = { id: createUser.id, email: createUser.email };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(ErrorCodes.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      throw new HttpException(ErrorCodes.INVALID_AUTHENTICATION_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtServicePayload = { id: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async currentUser(session: Record<string, any>) {
    try {
      const payload = this.jwtService.verify(session.jwt, { secret: Config.jwt.privateKey });
      return { currentUser: payload };
    } catch (error) {
      return { currentUser: null };
    }
  }
}
