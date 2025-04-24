import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AcuarioService {

  constructor(private http: HttpClient) { }

  // Cuando la API esté lista
  // getPeceras(): Observable<any> {
  //   return this.http.get('https://tudominio.com/api/peceras');
  // }

  // getPeceraById(id: string): Observable<any> {
  //   return this.http.get(`https://tudominio.com/api/peceras/${id}`);
  // }

  // De momento consumiendo archivos locales
  getPeceras(): Observable<any> {
    return this.http.get('/assets/peceras.json');
  }

  getPeceraById(id: string): Observable<any> {
    return this.http.get(`/json/pecera-${id}.json`);
  }

}
