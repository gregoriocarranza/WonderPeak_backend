export interface IInteractions {
  id?: number;
  userUuid: string;
  postUuid: string;
}

export interface IInteractionsDAO<I, O> {
  getAllByPost: (
    postUuid: string,
    offset: number,
    limit: number
  ) => Promise<any>;
  getAllByUser: (
    userUuid: string,
    offset: number,
    limit: number
  ) => Promise<any>;
}
