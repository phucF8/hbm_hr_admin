export interface DwhEtlJobLogDto {
  id: number;
  idJob: number;
  jobName: string;
  logDate: string;
  errors: number;
  logField: string;
  createdAt: string;
  selected?: boolean;
}

export interface PagedResult<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
}

export interface DwhLogListRequest {
  pageNumber: number;
  pageSize: number;
  idJob?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type DataWarehouseItem = DwhEtlJobLogDto;
export type DataWarehouseListResponse = PagedResult<DwhEtlJobLogDto>;
