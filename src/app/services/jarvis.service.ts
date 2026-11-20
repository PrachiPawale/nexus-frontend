import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JarvisService {

  private apiUrl = 'https://nexus-ai-service-hpkg.onrender.com';

  constructor(private http: HttpClient) {}

  // Process Nexus commands
  processCommand(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-command`, {
      text: text
    });
  }

  // Chat with JARVIS
  chat(text: string, sessionId: string = 'nexus-user'): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, {
      text: text,
      session_id: sessionId
    });
  }

  // Retrieve conversation history
  getConversation(sessionId: string = 'nexus-user'): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversation/${sessionId}`);
  }

  // Clear conversation history
  clearConversation(sessionId: string = 'nexus-user'): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversation/${sessionId}`);
  }
}