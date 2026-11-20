import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class JarvisService {
  private apiUrl = environment.aiServiceUrl;

  constructor(private http: HttpClient) {}

  processCommand(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-command`, { text });
  }

  chat(text: string, sessionId: string = "nexus-user"): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, {
      text,
      session_id: sessionId,
    });
  }

  getConversation(sessionId: string = "nexus-user"): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversation/${sessionId}`);
  }

  clearConversation(sessionId: string = "nexus-user"): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversation/${sessionId}`);
  }
}
