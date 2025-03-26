import { Injectable } from '@angular/core';
import md5 from 'md5';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  encrypt(password: string): string {
    if (!password) return '';
    
    // Create MD5 hash
    const md5Hash = md5(password);
    
    // Format the hash to match the C# implementation
    let ret = '';
    for (let i = 0; i < md5Hash.length; i += 2) {
      const byte = parseInt(md5Hash.substr(i, 2), 16);
      if (byte < 16) {
        ret += '0' + byte.toString(16);
      } else {
        ret += byte.toString(16);
      }
    }
    return ret;
  }
} 