import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private apiUrl = `${environment.apiUrl}/notes`;

  // Temporary current user ID, consistent with the existing Nexus setup
  private currentUserId = 1;

  constructor(private http: HttpClient) {}

  // Get all notes
  getNotes(userId: number = this.currentUserId): Observable<any> {
    return this.http.get(
      `${this.apiUrl}?user_id=${userId}`
    );
  }

  // Get one note
  getNote(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }

  // Create note
  createNote(note: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      ...note,
      user_id: note.user_id || this.currentUserId
    });
  }

  // Update note
  updateNote(id: number, note: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {
      ...note,
      user_id: note.user_id || this.currentUserId
    });
  }

  // Delete note
  deleteNote(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }
}