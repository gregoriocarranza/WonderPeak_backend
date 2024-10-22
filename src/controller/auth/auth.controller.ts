import { NextFunction, Response } from 'express';
import { inputValidator } from '../../utils/inputValidator';
import { IUser } from '../../../SQL/Interface/IUser';
import { UserService } from '../../Services/User/user.service';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { UserInputDTO } from '../../../SQL/dto/user/user.input.dto';
import { AuthService } from '../../Services/auth/auth.service';
import { RegisterDTO } from '../../dto/input/register.dto';
import { LoginDto } from '../../dto/input/login.dto';
import { IAuthResponse } from './auth.interface';
import { authResponseDTO } from '../../dto/auth/authResponse.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';

export class AuthController {
  private readonly _authService: AuthService = new AuthService();
  private readonly _userService: UserService = new UserService();
  constructor() {}

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
      Object.assign(registerDTO, {
        auth0Id: auth0Signup.result.user_id,
      });
      const userData: UserInputDTO = new UserInputDTO({
        userUuid: uuidv4(),
        ...registerDTO,
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
      res.status(200).json({
        success: true,
        data: responseFormatted,
      });
    } catch (err: any) {
      if (err.statusCode) {
        err.statusCode = err.statusCode;
      }
      next(err);
    }
  }

  public async logOut(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO Agregar logica de cambio de estado o log out de aplicacion
      res.status(200).json({
        success: true,
        message: 'User signed out',
      });
    } catch (err) {
      next(err);
    }
  }
  public async changeMail(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const response: any = await this._authService.changeUserEmail(
        req.auth.sub,
        email
      );
      if (!response) {
        const error: any = new Error('The email update failed');
        error.statusCode = 400;
        return next(error);
      }
      const user: IUser = req.user;
      Object.assign(user, { email: response.email });
      const updatedUser: IUser | null = await this._userService.update(user);
      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }
}
