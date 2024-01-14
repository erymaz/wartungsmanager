import { ApiProperty } from '@nestjs/swagger';

export interface DataResponse<T, U extends {} = {}> {
  data: T;
  meta: U;
}

export interface DataResponseMeta {
  [key: string]: unknown;
}

export function asResponse<T>(obj: T): DataResponse<T>;
export function asResponse<T, U extends {} = {}>(obj: T, metaObj: U): DataResponse<T, U>;
export function asResponse(obj: unknown, metaObj?: unknown): { data: unknown; meta: unknown } {
  if (metaObj) {
    return {
      data: obj,
      meta: metaObj,
    };
  } else {
    return {
      data: obj,
      meta: {},
    };
  }
}

export interface ResponsePagingMeta {
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

export class ApiResponse<T, U = DataResponseMeta> implements DataResponse<T, U> {
  @ApiProperty({ type: Object })
  data!: T;

  @ApiProperty({ type: Object })
  meta!: U;
}

export class ApiPaginationMeta implements ResponsePagingMeta {
  @ApiProperty({ type: Number })
  count!: number;

  @ApiProperty({ type: Number })
  total!: number;

  @ApiProperty({ type: Number })
  page!: number;

  @ApiProperty({ type: Number })
  pageCount!: number;
}

export class ApiManyData<T> implements DataResponse<T[]> {
  @ApiProperty({ type: Object, isArray: true })
  data!: T[];

  @ApiProperty({ type: ApiPaginationMeta })
  meta!: ApiPaginationMeta;
}

export function getResponseFor<T extends Function>(type: T): typeof ApiResponse {
  class ApiResponseForEntity extends ApiResponse<T> {
    @ApiProperty({ type })
    data!: T;
  }
  Object.defineProperty(ApiResponseForEntity, 'name', {
    value: `ApiResponseForEntity${type.name}`,
  });

  return ApiResponseForEntity as typeof ApiResponse;
}

export function getResponseForMany<T extends Function>(type: T): typeof ApiResponse {
  class ApiResponseForEntityArray extends ApiManyData<T> {
    @ApiProperty({
      type,
      isArray: true,
    })
    data!: T[];
  }
  Object.defineProperty(ApiResponseForEntityArray, 'name', {
    value: `ApiResponseForEntityMany${type.name}`,
  });

  return ApiResponseForEntityArray as typeof ApiResponse;
}
