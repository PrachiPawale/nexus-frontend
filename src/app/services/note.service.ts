import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private apiUrl = `${environment.apiUrl}/notes`;

  constructor(private http: HttpClient) {}

  getNotes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getNote(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createNote(note: any): Observable<any> {
    return this.http.post(this.apiUrl, note);
  }

  updateNote(id: number, note: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}