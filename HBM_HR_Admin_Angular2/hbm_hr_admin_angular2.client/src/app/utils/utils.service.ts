// shared/utils.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  calculateTableIndex(index: number, pageNumber: number, pageSize: number): number {
    return (pageNumber - 1) * pageSize + index + 1;
  }
  
}