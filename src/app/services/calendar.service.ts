import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl = `${environment.apiUrl}/calendar`;

  // Temporary current user ID
  private currentUserId = 1;

  constructor(private http: HttpClient) {}

  // Get all events for a user
  getEvents(userId: number = this.currentUserId): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}`);
  }

  // Get a specific event
  getEvent(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }

  // Create an event
  createEvent(event: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      ...event,
      user_id: event.user_id || this.currentUserId
    });
  }

  // Update an event
  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {
      ...event,
      user_id: event.user_id || this.currentUserId
    });
  }

  // Delete an event
  deleteEvent(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }
}