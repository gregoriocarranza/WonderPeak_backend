import { Router } from 'express';
import { UserController } from '../Controller/user/user.controller';
import { decodeJwtMiddleware } from '../Middlewares/apiAuth.middleware';
import { userMandatory } from '../Middlewares/userAuth.middleware';

export class UserRouter {
  public router: Router = Router();
  private readonly _userController: UserController = new UserController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(
      '/',
      decodeJwtMiddleware,
      userMandatory,
      this._userController.getAll.bind(this._userController)
    );
    this.router.get(
      '/me',
      decodeJwtMiddleware,
      userMandatory,
      this._userController.getByJwt.bind(this._userController)
    );
    this.router.delete(
      '/me',
      decodeJwtMiddleware,
      userMandatory,
      this._userController.delete.bind(this._userController)
    );
    this.router.put(
      '/me',
      decodeJwtMiddleware,
      userMandatory,
      this._userController.updateMisc.bind(this._userController)
    );
    this.router.put(
      '/:userUuid/following',
      decodeJwtMiddleware,
      userMandatory,
      this._userController.followUser.bind(this._userController)
    );
  }
}
