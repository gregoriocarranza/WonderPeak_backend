export interface IBaseDAO<I, O> {
  getAll: (offset: number, limit: number) => Promise<any>;
  getById: (id: number) => Promise<O | null>;
  getByUuid: (uuid: string) => Promise<O | null>;
  create: (i: I) => Promise<O | null>;
  update: (i: I) => Promise<O | null>;
  delete: (uuid: string) => Promise<void>;
}
