import { Router } from 'express';
import { CommentController } from '../Controller/comment/comment.controller';
import { decodeJwtMiddleware } from '../Middlewares/apiAuth.middleware';
import { userMandatory } from '../Middlewares/userAuth.middleware';

export class CommentRouter {
  public router: Router = Router();
  private readonly _commentController: CommentController = new CommentController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      '/post/:postUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._commentController.create.bind(this._commentController)
    );
    this.router.get(
      '/post/:postUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._commentController.getAll.bind(this._commentController)
    );
    this.router.get(
      '/:commentUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._commentController.getByUuid.bind(this._commentController)
    );
    this.router.put(
      '/:commentUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._commentController.updateMiscs.bind(this._commentController)
    );
    this.router.delete(
      '/:commentUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._commentController.delete.bind(this._commentController)
    );
  }
}
