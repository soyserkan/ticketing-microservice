import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { SkipAuth } from '@ssticketmicroservice/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SkipAuth()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signupUser(@Session() session: Record<string, any>, @Body() signUpDto: SignUpDto) {
    const response = await this.userService.signUp(signUpDto);
    session.jwt = response.token;
    return response;
  }

  @SkipAuth()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Session() session: Record<string, any>, @Body() signInDto: SignInDto) {
    const response = await this.userService.signIn(signInDto);
    session.jwt = response.token;
    return response;
  }

  @SkipAuth()
  @Get('currentuser')
  @HttpCode(HttpStatus.OK)
  async currentUser(@Session() session: Record<string, any>) {
    return this.userService.currentUser(session);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Req() req: any) {
    req.session = null;
    return;
  }
}
