import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?user_id=${userId}`);
  }

  getTask(id: number, userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(this.apiUrl, task);
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      task
    );
  }

  deleteTask(id: number, userId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}?user_id=${userId}`
    );
  }
}