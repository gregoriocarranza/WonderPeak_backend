import { NextFunction, Response } from 'express';
import { inputValidator } from '../../utils/inputValidator';
import { IUser } from '../../../SQL/Interface/IUser';
import { UserService } from '../../Services/User/user.service';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import path from 'path';

import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
import { AuthService } from '../../Services/auth/auth.service';
import { RegisterDTO } from '../../dto/input/register.dto';
import { LoginDto } from '../../dto/input/login.dto';
import { IAuthResponse, PasswordResetPayload } from './auth.interface';
import { authResponseDTO } from '../../dto/auth/authResponse.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { IAuthController } from './auth.controller.interface';
import { EmailService } from '../../Services/Email/email.service';
import { parseError } from '../../utils/parseError';

export class AuthController implements IAuthController {
  private readonly _authService: AuthService = new AuthService();
  private readonly _userService: UserService = new UserService();
  private readonly _emailService: EmailService = new EmailService();
  private readonly SECRET_KEY: string;

  constructor() {
    this.SECRET_KEY = process.env.JWT_SECRET || 'yourSecretKey';
  }

  public async register(
    req: Request | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const registerDTO: any = new RegisterDTO(req.body).build();
      const validation = await inputValidator(registerDTO);
      if (!validation.success) {
        const error: any = new Error(validation.message);
        error.statusCode = 400;
        return next(error);
      }
      const userExist1: IUser | null = await this._userService.getByEmail(
        registerDTO.email
      );
      const userExist2: IUser | null = await this._userService.getByFirsName(
        registerDTO.name
      );
      if (!_.isNil(userExist1) && !_.isNil(userExist2)) {
        const error: any = new Error('User Already exists');
        error.statusCode = 409;
        return next(error);
      }
      const auth0Signup: any = await this._authService.createUser({
        username: registerDTO.name,
        email: registerDTO.email,
        password: registerDTO.password,
      });
      const userData: UserInputDTO = new UserInputDTO({
        userUuid: uuidv4(),
        ...req.body,
        auth0Id: auth0Signup.result.user_id,
      }).build();
      const createdUser: IUser | null =
        await this._userService.create(userData);
      if (_.isNil(createdUser || !auth0Signup)) {
        return next(new Error('Error creating the user'));
      }
      res.status(200).json({
        success: true,
        message: `User created, go to your inbox to confirm the email`,
      });
    } catch (err: any) {
      if (err.statusCode) {
        err.statusCode = err.statusCode;
      }
      next(err);
    }
  }

  public async login(
    req: Request | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginDto: any = new LoginDto(req.body).build();
      const validation = await inputValidator(loginDto);
      if (!validation.success) {
        const error: any = new Error(validation.message);
        error.statusCode = 400;
        return next(error);
      }
      const loginResponse: any = await this._authService.login({
        email: loginDto.email,
        password: loginDto.password,
      });
      const responseFormatted: IAuthResponse = new authResponseDTO(
        loginResponse
      ).build();

      const user: IUser | null = await this._userService.getByEmail(
        loginDto.email
      );
      if (!user) {
        return next(await parseError('User not found', 404));
      }
      await this._userService.update({
        active: true,
        pushToken: null,
        userUuid: user.userUuid,
      });

      res.status(200).json({
        success: true,
        data: responseFormatted,
      });
    } catch (err: any) {
      next(err);
    }
  }

  public async logOut(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      await this._userService.update({
        active: false,
        pushToken: null,
        userUuid,
      });

      res.status(200).json({
        success: true,
        message: 'User signed out',
      });
    } catch (err) {
      next(err);
    }
  }
  public async forgotPassword(
    req: Request | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        return next(await parseError('Error with the email', 500));
      }
      const userExist: IUser | null = await this._userService.getByEmail(email);
      if (userExist) {
        const token = jwt.sign(
          {
            userUuid: userExist.userUuid,
            email: userExist.email,
          },
          this.SECRET_KEY,
          { expiresIn: '15m' }
        );
        const resetUrl = `${process.env.FRONT_HOST}/reset-password?resetToken=${token}`;
        const filePath = path.join(
          __dirname,
          '..',
          '..',
          'Templates',
          'forgotPassword.html'
        );
        const htmlContent = this._emailService.loadTemplate(filePath, {
          URL_RECUPERACION: resetUrl,
        });
        const info = await this._emailService.sendMail(
          email,
          'Recupero de contraseña',
          '',
          htmlContent
        );
        console.info('Correo enviado:', info.response);
      }

      res.status(200).json({
        success: true,
        data: {
          message:
            'Revisa tu correo electronico que ingresaste! Te enviamos un correo electronico detallando los pasos a seguir',
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async resetPassword(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { resetToken } = req.query;
      const { contraseña } = req.body;
      const { email } = jwt.verify(
        resetToken,
        this.SECRET_KEY
      ) as PasswordResetPayload;
      const userExist: IUser | null = await this._userService.getByEmail(email);
      if (_.isNil(userExist)) {
        const error: any = new Error('User is not valid for a password change');
        error.statusCode = 400;
        return next(error);
      }
      await this._authService.changeUserPassword(userExist.auth0Id, contraseña);

      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'Templates',
        'passwordReseted.html'
      );
      const htmlContent = this._emailService.loadTemplate(filePath);
      const response = await this._emailService.sendMail(
        email,
        'Recupero de contraseña',
        '',
        htmlContent
      );

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err) {
      next(err);
    }
  }

  public async registerPushToken(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;
      const { userUuid } = req.user;
      if (!token) {
        return next(
          await parseError('Token not found in your application', 500)
        );
      }

      await this._userService.update({
        pushToken: token,
        userUuid,
      });

      res.status(200).json({
        success: true,
        message: "'User Token successfully register'",
      });
    } catch (err) {
      next(err);
    }
  }
}
