import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import urlJoin from 'url-join';

@Pipe({
  name: 'iconUrl',
})
export class IconUrlPipe implements PipeTransform {
  transform(value: string, ...args: string[]): unknown {
    if (value) {
      if (value.includes('http://') || value.includes('https://')) {
        return value;
      }
      return urlJoin(environment.fileServiceUrl, 'v1/file', value);
    }
    if (args.includes('noStubImg')) {
      return '';
    }
    return 'https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg';
  }
}
