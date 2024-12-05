import { CommentDAO } from '../../../SQL/dao/comment.dao';
import { CommentInputDTO } from '../../../SQL/dto/comment/comment.input.dto';
import { IDataPaginator } from '../interfaces/IDataPaginator';
import { IComment } from '../../../SQL/Interface/IComment';
import { PostDAO } from '../../../SQL/dao/post.dao';

export class CommentService {
  private _commentDAO: CommentDAO = new CommentDAO();
  private _postDAO: PostDAO = new PostDAO();
  constructor() {}

  async getAllByPostUuid(
    postUuid: string,
    offset: number,
    limit: number
  ): Promise<IDataPaginator<IComment>> {
    return await this._commentDAO.getAllByPost(postUuid, offset, limit);
  }

  async getAllByUserUuid(
    userUuid: string,
    offset: number,
    limit: number
  ): Promise<IDataPaginator<IComment>> {
    return await this._commentDAO.getAllByUser(userUuid, offset, limit);
  }

  async getByUuid(uuid: string): Promise<IComment | null> {
    return await this._commentDAO.getByUuid(uuid);
  }

  async create(comment: CommentInputDTO | any): Promise<IComment | null> {
    return await this._commentDAO.create(comment);
  }

  async update(comment: any): Promise<IComment | null> {
    return await this._commentDAO.update(comment);
  }

  async delete(uuid: string): Promise<void> {
    return await this._commentDAO.delete(uuid);
  }

  set commentDAO(commentDAO: CommentDAO) {
    this._commentDAO = commentDAO;
  }

  public async incrementCommentCount(postUuid: string): Promise<void> {
    try {
      await this._postDAO.incrementCommentCount(postUuid);
    } catch (error) {
      console.error('Error incrementing comment count:', error);
      throw new Error('Could not increment comment count');
    }
  }

  public async decrementCommentCount(postUuid: string): Promise<void> {
    try {
      await this._postDAO.decrementCommentCount(postUuid);
    } catch (error) {
      console.error('Error decrementing comment count:', error);
      throw new Error('Could not decrement comment count');
    }
  }
}
