import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private apiUrl = `${environment.apiUrl}/goals`;

  private currentUserId = 1;

  constructor(private http: HttpClient) {}

  // Get all goals
  getGoals(userId: number = this.currentUserId): Observable<any> {
    return this.http.get(
      `${this.apiUrl}?user_id=${userId}`
    );
  }

  // Get one goal
  getGoal(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }

  // Create goal
  createGoal(goal: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      ...goal,
      user_id: goal.user_id || this.currentUserId
    });
  }

  // Update goal
  updateGoal(id: number, goal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {
      ...goal,
      user_id: goal.user_id || this.currentUserId
    });
  }

  // Delete goal
  deleteGoal(
    id: number,
    userId: number = this.currentUserId
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }
}