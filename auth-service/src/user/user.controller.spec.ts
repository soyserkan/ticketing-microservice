import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

describe('UserController', () => {
  let userService: UserService;
  let userController: UserController;

  const jwtToken = 'jwtToken';

  const mockUserService = {
    signUp: jest.fn().mockResolvedValueOnce({ token: jwtToken }),
    signIn: jest.fn().mockResolvedValueOnce({ token: jwtToken }),
    currentUser: jest.fn().mockResolvedValueOnce({ currentUser: { id: 1, email: 'serkansoy@gmail.com' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('signUp', () => {
    it('should register a new user', async () => {
      const signUpDto: SignUpDto = { name: 'Serkan', surname: 'Soy', email: 'serkansoy@gmail.com', password: 'password' };
      const session: Record<string, any> = {};

      const result = await userController.signupUser(session, signUpDto);
      expect(userService.signUp).toHaveBeenCalled();
      expect(result.token).toEqual(jwtToken);
      expect(session.jwt).toEqual(result.token);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const signInDto: SignInDto = { email: 'serkansoy@gmail.com', password: 'password' };
      const session: Record<string, any> = {};

      const result = await userController.signIn(session, signInDto);
      expect(userService.signIn).toHaveBeenCalled();
      expect(result.token).toEqual(jwtToken);
      expect(session.jwt).toEqual(result.token);
    });
  });

  describe('current user', () => {
    it('should return current user', async () => {
      const session: Record<string, any> = { jwt: 'mockToken' };

      const result = await userController.currentUser(session);
      expect(userService.currentUser).toHaveBeenCalled();
      expect(result.currentUser).toEqual({ id: 1, email: 'serkansoy@gmail.com' });
    });
  });

  describe('signout', () => {
    it('should clear session', async () => {
      const mockRequest = { session: { jwt: 'mockToken' } };
      await userController.signout(mockRequest);

      expect(mockRequest.session).toBeNull();
    });
  });
});
