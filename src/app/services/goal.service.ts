import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private apiUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  getGoals(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getGoal(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createGoal(goal: any): Observable<any> {
    return this.http.post(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}