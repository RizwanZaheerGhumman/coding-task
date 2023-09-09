import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.PRIVATE_KEY.replace(/\\\\n/gm, '\\n')}`,
      algorithms: ['RS512'],
    });
  }

  /**
   * @description Validate the token and return the user
   * @param payload string
   * @returns User
   */
  async validate(payload: any): Promise<any> {
    // const res = await this.userService.findByEmail(payload.email);
    // if (res.status === HttpStatus.NOT_FOUND || payload.isRefreshToken) {
    //   throw new HttpException(
    //     ExceptionMessageConstant.INVALID_TOKEN,
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }
    // return res.content as User;
  }
}
