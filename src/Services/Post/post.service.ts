import { PostDAO } from '../../../SQL/dao/post.dao';
import { PostInputDTO } from '../../../SQL/dto/post/post.input.dto';
import { IDataPaginator } from '../interfaces/IDataPaginator';
import { IPost } from '../../../SQL/Interface/IPost';
import cloudinary from '../../Configurations/Cloudinary';
import { LikesDAO } from '../../../SQL/dao/likes.dao';
import { InteractionsInputDTO } from '../../../SQL/dto/interactions/interaction.dto';
import { IInteractions } from '../../../SQL/Interface/IInteractions';
import { FavoritesDAO } from '../../../SQL/dao/favorites.dao';
import { Readable } from 'stream';
export class PostService {
  private _postDAO: PostDAO = new PostDAO();
  private _likeDAO: LikesDAO = new LikesDAO();
  private _favoriteDAO: FavoritesDAO = new FavoritesDAO();
  constructor() {}

  async uploadImageBase64(
    base64Data: string,
    userUuid: string
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: 'WonderPeak_Posts',
        public_id: `${userUuid}+${Date.now()}`,
        use_filename: false,
        unique_filename: false,
      });
      console.log('Imagen subida con éxito:', result.secure_url);
      return result.secure_url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  /**
   * Sube un archivo a Cloudinary desde un buffer
   * @param fileBuffer - El buffer del archivo
   * @param userUuid - UUID del usuario para identificar la imagen
   * @returns La URL segura del archivo subido
   */
  async uploadFileToCloudinary(
    fileBuffer: Buffer,
    userUuid: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'WonderPeak_Posts',
          public_id: `${userUuid}-${Date.now()}`,
          resource_type: 'auto',
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error('Error al subir el archivo:', error);
            return reject(error);
          }
          if (result?.secure_url) {
            console.log('Archivo subido con éxito:', result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error('No se pudo obtener la URL segura del archivo'));
          }
        }
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null); // Marca el final del stream
      readableStream.pipe(uploadStream);
    });
  }

  async getFeed(
    offset: number,
    limit: number,
    followersUuidsLists: Array<string>
  ): Promise<IDataPaginator<IPost>> {
    return await this._postDAO.getFeed(offset, limit, followersUuidsLists);
  }

  async getAllByUserUuid(
    uuid: string,
    offset: number,
    limit: number
  ): Promise<IDataPaginator<IPost>> {
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

  public async getFavorite(
    userUuid: string,
    postUuid: string
  ): Promise<IInteractions | null> {
    return await this._favoriteDAO.getFavorites(userUuid, postUuid);
  }

  public async favorite(
    favoriteInputDto: InteractionsInputDTO
  ): Promise<IInteractions | null> {
    return await this._favoriteDAO.create(favoriteInputDto);
  }

  public async removeFavorite(
    userUuid: string,
    postUuid: string
  ): Promise<void> {
    return await this._favoriteDAO.delete(userUuid, postUuid);
  }

  public async getLike(
    userUuid: string,
    postUuid: string
  ): Promise<IInteractions | null> {
    return await this._likeDAO.getLike(userUuid, postUuid);
  }

  public async like(
    likeInputDto: InteractionsInputDTO
  ): Promise<IInteractions | null> {
    return await this._likeDAO.create(likeInputDto);
  }
  public async removeLike(userUuid: string, postUuid: string): Promise<void> {
    return await this._likeDAO.delete(userUuid, postUuid);
  }

  set postDAO(postDAO: PostDAO) {
    this._postDAO = postDAO;
  }
}
