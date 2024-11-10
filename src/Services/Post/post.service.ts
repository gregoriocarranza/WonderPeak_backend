import { PostDAO } from '../../../SQL/dao/post.dao';
import { PostInputDTO } from '../../../SQL/dto/post/post.input.dto';
import { IDataPaginator } from '../interfaces/IDataPaginator';
import { IPost } from '../../../SQL/Interface/IPost';

export class PostService {
  private _postDAO: PostDAO = new PostDAO();
  constructor() {}

  async getFeed(
    offset: number,
    limit: number,
  ): Promise<IDataPaginator<IPost>> {
    return await this._postDAO.getFeed(offset, limit);
  }

  async getAllByUserUuid(uuid: string): Promise<IPost[] | null> {
    return await this._postDAO.getAllByUserUuid(uuid, offset, limit);
  }

  async getByUuid(uuid: string): Promise<IPost | null> {
    return await this._postDAO.getByUuid(uuid);
  }

  async create(post: PostInputDTO | any): Promise<IPost | null> {
    return await this._postDAO.create(post);
  }

  async update(post: any): Promise<IPost | null> {
    return await this._postDAO.update(post);
  }

  async delete(uuid: string): Promise<void> {
    return await this._postDAO.delete(uuid);
  }

  public async favorite(postDTO: PostInputDTO): Promise<boolean> {
    return await this._postDAO.favorite(postDTO);
  }

  public async like(postDTO: PostInputDTO): Promise<boolean> {
    return await this._postDAO.like(postDTO);
  }

  set postDAO(postDAO: PostDAO) {
    this._postDAO = postDAO;
  }
}
