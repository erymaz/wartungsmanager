import { Pipe, PipeTransform } from '@angular/core';

import { UserApiService } from '../services/user-api.service';

@Pipe({
  name: 'username',
})
export class UsernamePipe implements PipeTransform {

  constructor(private userApiService: UserApiService) {}

  transform<T extends object>(id: string): Promise<string> {
    return this.userApiService.getUser(id)
      .then(user => user?.name || id)
      .catch(err => id);
  }
}
