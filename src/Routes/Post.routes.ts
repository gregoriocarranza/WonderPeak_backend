import { Router } from 'express';
import { PostController } from '../Controller/post/post.controller';
import { decodeJwtMiddleware } from '../Middlewares/apiAuth.middleware';
import { userMandatory } from '../Middlewares/userAuth.middleware';

export class PostRouter {
  public router: Router = Router();
  private readonly _postController: PostController = new PostController();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      '/',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.create.bind(this._postController)
    );
    this.router.get(
      '/feed',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.getAll.bind(this._postController)
    );
    this.router.get(
      '/favorites',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.getFavorites.bind(this._postController)
    );
    this.router.get(
      '/:postUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.getByUuid.bind(this._postController)
    );
    this.router.get(
      '/user/:userUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.getAllByUserUuid.bind(this._postController)
    );
    this.router.put(
      '/:postUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.updateMiscs.bind(this._postController)
    );
    this.router.delete(
      '/:postUuid',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.delete.bind(this._postController)
    );
    this.router.put(
      '/:postUuid/favorite',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.putFavorite.bind(this._postController)
    );
    this.router.put(
      '/:postUuid/like',
      decodeJwtMiddleware,
      userMandatory,
      this._postController.putLike.bind(this._postController)
    );
  }
}
