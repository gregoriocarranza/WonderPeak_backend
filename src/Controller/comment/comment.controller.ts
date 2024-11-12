import { CommentInputDTO } from '../../../SQL/dto/comment/comment.input.dto';
import { SqlValidatorError } from '../../../SQL/error/sql.validator.error';
import { IComment } from '../../../SQL/Interface/IComment';
import { CommentService } from '../../Services/Comment/comment.service';
import { UuidInputDTO } from '../../dto/input/uuid.input.dto';
import { CommentDTO } from '../../dto/comment/comment.dto';
import { CommentMiscUpdateInputDTO } from '../../dto/comment/comment.misc.update.dto';
import { IRequestExtendedUser } from '../../Middlewares/interfaces/user.middleware.interfaces';
import { IDataPaginator } from '../../Services/interfaces/IDataPaginator';
import { inputValidator } from '../../utils/inputValidator';
import { paginationHelper } from '../../utils/pagination.helper';
import { parseError } from '../../utils/parseError';
import { IInputValidator } from '../../utils/types';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';  

export class CommentController implements CommentController {
  private _commentService: CommentService = new CommentService();

  constructor() {}

  public async getAll(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = paginationHelper(req);
      const { postUuid } = req.params;
      const newpage: number = page;
      let newLimit: number = limit;
      newLimit = newLimit === 0 ? 20 : newLimit;
      const offset = newpage * newLimit;
      const result: IDataPaginator<IComment> = await this._commentService.getAllByPostUuid(
        postUuid,
        offset,
        newLimit
      );
      const commentsPromises: Promise<CommentDTO>[] =
        result.data?.map(async (a) => await new CommentDTO(a).build()) || [];
      const commentsDTO: CommentDTO[] = await Promise.all(commentsPromises);
      res.json({ ...result, ...{ data: commentsDTO } });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error getting Feed'));
      }
    }
  }

  public async getByUuid(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { commentUuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(commentUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const comment: IComment | null = await this._commentService.getByUuid(commentUuid);
      if (!comment) {
        return next(await parseError('Comment not found', 404));
      }
      const commentDTO: CommentDTO = await new CommentDTO(comment).build();
      res.status(200).json({
        success: true,
        data: commentDTO,
      });
    } catch (err: any) {
      next(err);
    }
  }

  public async create(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { postUuid } = req.params;
    const commentInputDTO: CommentInputDTO = new CommentInputDTO({
      commentUuid: uuidv4(),
      postUuid: postUuid,
      userUuid: req.user.userUuid,
      ...req.body,
    }).build();

    const comment: IComment | null = await this._commentService.create(commentInputDTO);
    const commentDTO: CommentDTO = await new CommentDTO(comment).build();
    res.json({
      success: true,
      data: commentDTO,
    });
  }

  public async updateMiscs(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const { commentUuid } = req.params;
      const commentUpdateInputDTO: CommentMiscUpdateInputDTO = new CommentMiscUpdateInputDTO({
        ...req.body,
      }).build();
      const validation: IInputValidator =
        await inputValidator(commentUpdateInputDTO);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const commentData: IComment | null =
        await this._commentService.getByUuid(commentUuid);
      if (!commentData) {
        return next(await parseError('Comment not found', 404));
      }
      if (userUuid != commentData.userUuid) {
        return next(
          await parseError('User not authorized to do this action', 401)
        );
      }
      Object.assign(commentUpdateInputDTO, { commentUuid });
      const comment: IComment | null =
        await this._commentService.update(commentUpdateInputDTO);
      const commentDTO: CommentDTO = await new CommentDTO(comment).build();
      res.json({
        success: true,
        data: commentDTO,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error updating an Comment'));
      }
    }
  }

  public async delete(
    req: IRequestExtendedUser | any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userUuid } = req.user;
      const { commentUuid } = req.params;
      const inputDto: UuidInputDTO = new UuidInputDTO(commentUuid).build();
      const validation: IInputValidator = await inputValidator(inputDto);
      if (!validation.success) {
        return next(await parseError(validation.message, 400));
      }
      const commentData: IComment | null =
        await this._commentService.getByUuid(commentUuid);
      if (!commentData) {
        return next(await parseError('Comment not found', 404));
      }
      if (userUuid != commentData.userUuid) {
        return next(
          await parseError('User not authorized to do this action', 401)
        );
      }
      await this._commentService.delete(inputDto.uuid);
      res.json({
        success: true,
      });
    } catch (err: any) {
      if (err instanceof SqlValidatorError) {
        req.statusCode = err.statusCode;
        next(err);
      } else {
        console.error(err.message, err.stack);
        next(new Error('Error deleting an Comment'));
      }
    }
  }
}
