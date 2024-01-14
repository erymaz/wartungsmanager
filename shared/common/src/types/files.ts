export type FileId = string;

export interface FileMetaResponse {
  id: FileId;
  isImage: boolean;
  mimeType: string[];
  mimeTypeRaw: string;
  name: string;
  md5: string;
}

export interface FileResponse extends FileMetaResponse {
  url: string;
}

export type CopyFileResult = FileResponse;
