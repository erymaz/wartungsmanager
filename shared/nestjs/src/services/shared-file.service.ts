import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthInfo } from 'shared/common/types';
import { FileId, FileResponse } from 'shared/common/types/files';
import { DataResponse } from 'shared/nestjs/models/data-response';

import { SharedApiService } from './shared-api.service';
import { SharedService } from './shared-service';

@Injectable()
export class SharedFileService {
  constructor(private readonly sharedApiService: SharedApiService) {}

  /**
   * Clones a file, identified by `fileId` and returns the id of
   * the newly created and cloned file. If the file does not exist,
   * an error is thrown
   *
   * @param authInfo The user token and information to use for the
   * request
   * @param fileId The id of the file to clone
   * @param privileged If the operation should not consider any rights checks.
   * (If I use this argument, I confirm that I know what I do)
   * @returns The id of the cloned file
   */
  async cloneFileByIdOrFail(
    authInfo: AuthInfo,
    fileId: FileId,
    privileged = false,
  ): Promise<FileId> {
    try {
      const resp = await this.sharedApiService.httpGetOrFail<DataResponse<FileResponse>>(
        authInfo,
        SharedService.FILE_SERVICE,
        `v1/copy/${fileId}`,
        {},
        {},
        privileged,
      );

      return resp.data.data.id;
    } catch (ex) {
      if (ex.status === 404) {
        throw new NotFoundException(`Failed to clone file: no such file with id ${fileId}`);
      } else if (ex.status === 400) {
        throw new BadRequestException(`Failed to clone file: missing arguments (see logs)`);
      }

      // Other error occurred
      throw ex;
    }
  }
}
