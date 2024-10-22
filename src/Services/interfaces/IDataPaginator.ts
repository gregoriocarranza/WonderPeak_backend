export interface IDataPaginator<T> {
  success: boolean;
  data: Array<T>;
  page: number;
  limit: number;
  count: number;
  totalCount: number;
  totalPages: number;
}
