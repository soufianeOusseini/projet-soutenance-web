import { HttpParams } from '@angular/common/http';
import { formatNumber } from '@angular/common';

export class Statiques {
  static generateHttpParams(
    params: any,
    httpParams: HttpParams = new HttpParams(),
    currentKey: string = ''
  ): HttpParams {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        if (
          !(params[key] instanceof Map) &&
          !(params[key] instanceof Array) &&
          !(params[key] instanceof Object)
        ) {
          httpParams = httpParams.append(currentKey + key, params[key]);
        } else if (params[key] instanceof Array) {
          let array: Array<any> = params[key];
          array.forEach((element, index) => {
            if (element != null) {
              if (
                !(element instanceof Map) &&
                !(element instanceof Array) &&
                !(element instanceof Object)
              ) {
                httpParams = httpParams.append(
                  currentKey + key + '[' + index + ']',
                  element
                );
              } else {
                httpParams = this.generateHttpParams(
                  element,
                  httpParams,
                  currentKey + key + '[' + index + ']' + '.'
                );
              }
            }
          });
        } else if (params[key] instanceof Object) {
          httpParams = this.generateHttpParams(
            params[key],
            httpParams,
            currentKey + key + '.'
          );
        }
      }
    });

    return httpParams;
  }
}
