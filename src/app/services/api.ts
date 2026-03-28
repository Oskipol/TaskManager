import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})


export class ApiService {
  
  private url="http://localhost:5294/api";
  constructor(private http: HttpClient, private auth: AuthService){}

  private headers(){
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }
  register(username: string, email: string, password: string){
    return this.http.post<{token: string; username: string;}>(
      `${this.url}/Auth/register`,
      {username, email, password}
    );
  }
  login(email: string, password: string){
    return this.http.post<{token: string; username: string;}>(
      `${this.url}/Auth/login`,
      {email, password}
    );
  }
  getBoards(){
    return this.http.get<Board[]>(`${this.url}/Boards`,{
      headers: this.headers()
    });
  }
  createBoards(name: string){
    return this.http.post<Board>(`${this.url}/Boards`, {name} , {
      headers: this.headers()
    });
  }
  joinBoard(code :string){
    return this.http.post<Board>(`${this}/Boards/join`, {code} ,{
      headers: this.headers()
    });
  }
  getTasks(id: number ){
    return this.http.get<Task>(`${this.url}/Tasks/${id}`, {
      headers: this.headers()
    });
  }
  createTask(title: string, desc: string, boardId: number){
    return this.http.post<Task>(`${this.url}/Tasks`, {title, boardId}, {
      headers: this.headers()
    });
  }
  updateTask(taks: Task){
    return this.http.put<Task>(`${this.url}/Tasks`, taks, {
      headers: this.headers()
    });
  }
  
}
