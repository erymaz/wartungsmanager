export type DataResponseMeta = Record<string, unknown>;

export interface DataResponse<T, U extends DataResponseMeta = DataResponseMeta> {
  data: T;
  meta: U;
}
