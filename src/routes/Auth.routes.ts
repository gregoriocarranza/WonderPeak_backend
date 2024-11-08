import { Router } from 'express';
import { AuthController } from '../Controller/auth/auth.controller';
import { decodeJwtMiddleware } from '../Middlewares/apiAuth.middleware';
import { userMandatory } from '../Middlewares/userAuth.middleware';
export class AuthRouter {
  public router: Router = Router();
  private readonly _authController: AuthController = new AuthController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      '/register',
      this._authController.register.bind(this._authController)
    );
    this.router.post(
      '/login',
      this._authController.login.bind(this._authController)
    );
    this.router.post(
      '/logout',
      decodeJwtMiddleware,
      userMandatory,
      this._authController.logOut.bind(this._authController)
    );
    this.router.post(
      '/forgot_password',
      this._authController.forgotPassword.bind(this._authController)
    );
    this.router.post(
      '/reset_password',
      this._authController.resetPassword.bind(this._authController)
    );
  }
}
