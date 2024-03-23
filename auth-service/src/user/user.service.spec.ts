import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { ErrorCodes } from '@ssticketmicroservice/common';
import { SignInDto } from './dto/signin.dto';

class MockJwtService {
  signAsync(): Promise<string> {
    return Promise.resolve('mockedToken');
  }

  verify() {
    return { id: 1, email: 'example@example.com' };
  }
}

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useClass: MockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_REPOSITORY_TOKEN);
  });

  it('user service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('user respository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const signUpDto: SignUpDto = { name: 'John', surname: 'Doe', email: 'john@example.com', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const token = 'generatedToken';

      jest.spyOn(userRepository, 'findOne').mockReturnValueOnce(null);
      jest.spyOn(userRepository, 'create').mockReturnValueOnce({ ...signUpDto, id: 1, createdAt: new Date(), updatedAt: new Date() });
      jest.spyOn(userRepository, 'save').mockReturnValueOnce(signUpDto as any);
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.resolve(hashedPassword));
      jest.spyOn(MockJwtService.prototype, 'signAsync').mockReturnValueOnce(Promise.resolve(token));

      const result = await service.signUp(signUpDto);

      expect(result.token).toEqual(token);
    });

    it('should throw an error if user already exists', async () => {
      const existingUser = { id: 1, name: 'Jane', surname: 'Doe', email: 'jane@example.com', password: 'password', createdAt: new Date(), updatedAt: new Date() };
      const signUpDto: SignUpDto = { name: 'John', surname: 'Doe', email: 'jane@example.com', password: 'password' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

      try {
        await service.signUp(signUpDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorCodes.USER_ALREADY_REGISTERED);
      }
    });
  });

  describe('signIn', () => {
    it('should sign in the user and return a token', async () => {
      const signInDto: SignInDto = { email: 'john@example.com', password: 'password' };
      const user = { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', password: 'hashedPassword', createdAt: new Date(Date.now()), updatedAt: new Date(Date.now()) };
      const token = 'generatedToken';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(true));
      jest.spyOn(MockJwtService.prototype, 'signAsync').mockResolvedValue(token);

      const result = await service.signIn(signInDto);
      expect(result.token).toEqual(token);
    });

    it('should throw an error if user is not found', async () => {
      const signInDto: SignInDto = { email: 'nonexistent@example.com', password: 'password' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      try {
        await service.signIn(signInDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe(ErrorCodes.USER_NOT_FOUND);
      }
    });

    it('should throw an error if password is incorrect', async () => {
      const signInDto: SignInDto = { email: 'john@example.com', password: 'wrongPassword' };
      const user = { id: 1, name: 'John', surname: 'Doe', email: 'john@example.com', password: 'hashedPassword', createdAt: new Date(Date.now()), updatedAt: new Date(Date.now()) };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.resolve(false));

      try {
        await service.signIn(signInDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.message).toBe(ErrorCodes.INVALID_AUTHENTICATION_CREDENTIALS);
      }
    });
  });

  describe('currentUser', () => {
    it('should return current user if token is valid', async () => {
      const session = { jwt: 'validToken' };
      const payload = { id: 1, email: 'john@example.com' };

      jest.spyOn(MockJwtService.prototype, 'verify').mockReturnValueOnce(payload);

      const result = await service.currentUser(session);

      expect(result.currentUser).toEqual(payload);
    });

    it('should return null if token is invalid', async () => {
      const session = { jwt: 'invalidToken' };

      jest.spyOn(MockJwtService.prototype, 'verify').mockImplementation(() => {
        throw new Error();
      });

      const result = await service.currentUser(session);

      expect(result.currentUser).toBeNull();
    });
  });
});
