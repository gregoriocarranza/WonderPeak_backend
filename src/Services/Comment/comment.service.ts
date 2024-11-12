import { CommentDAO } from '../../../SQL/dao/comment.dao';
import { CommentInputDTO } from '../../../SQL/dto/comment/comment.input.dto';
import { IDataPaginator } from '../interfaces/IDataPaginator';
import { IComment } from '../../../SQL/Interface/IComment';

export class CommentService {
  private _commentDAO: CommentDAO = new CommentDAO();
  constructor() {}

  async getAllByPostUuid(
    postUuid: string,
    offset: number,
    limit: number
  ): Promise<IDataPaginator<IComment>> {
    return await this._commentDAO.getAllByPost(postUuid, offset, limit);
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
}
