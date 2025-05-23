import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AcuarioService {
  url: string = 'http://127.0.0.1:8000/peceras/';
  constructor(private http: HttpClient) { }


  getPeceras(): Observable<any> {
    return this.http.get("/assets/peceras.json");
  }

  getPeceraById(id: string): Observable<any> {
    return this.http.get(`/json/pecera-${id}.json`);
  }

}
