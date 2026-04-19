import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root',
})


export class ApiService {
  
  private url="/taskmanager-api/api";
  constructor(private http: HttpClient, private auth: AuthService){}

  private headers(){
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }
  register(username: string, email: string, password: string) {
  return this.http.post<string>(`${this.url}/Auth/register`, { username, email, password }, { responseType: 'text' as 'json' });
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
    return this.http.post<Board>(`${this.url}/Boards/join`, {code} ,{
      headers: this.headers()
    });
  }
  resendConfirmation(email: string) {
    return this.http.post(`${this.url}/Auth/resend-confirmation`, { email }, { responseType: 'text'});
  }

  getLeaders(boardId: number){
    return this.http.get<string[]>(`${this.url}/Boards/${boardId}/leaders`, {
      headers: this.headers()
    });
  }
  getPoints(boardId: number) {
  return this.http.get<{[key: string]: number}>(`${this.url}/boards/${boardId}/points`, {
    headers: this.headers()
  });
}
  setPoints(boardId: number, username: string, points: number){
    return this.http.post(`${this.url}/Boards/${boardId}/points`, {username, points}, {
      headers: this.headers()
    });
  }
  getSupervisors(boardId: number){
    return this.http.get<string[]>(`${this.url}/Boards/${boardId}/supervisors`, {
      headers: this.headers()
    });
  }

  changeRole(boardId: number, username: string, role: string) {
  return this.http.post(`${this.url}/boards/${boardId}/changeRole`,
    { username, role }, 
    { headers: this.headers() }
  );
  }

  getMembers(boardId: number){
    return this.http.get<string[]>(`${this.url}/Boards/${boardId}`, {
      headers: this.headers()
    });
  }
  getOwner(boardId: number){
  return this.http.get(`${this.url}/Boards/${boardId}/owner`, {
    headers: this.headers(),
    responseType: 'text'
  });
}
  getTasks(id: number ){
    return this.http.get<Task[]>(`${this.url}/Tasks/${id}`, {
      headers: this.headers()
    });
  }
  createTask(title: string, assignee: string, desc: string, boardId: number, points: number, dueDate: Date | null, CreatedBy: string){
    return this.http.post<Task>(`${this.url}/Tasks`, {title, AssignedTo:assignee, description: desc, boardId, Points: points, DueDate: dueDate, CreatedBy}, {
      headers: this.headers()
    });
  }
  deleteTask(id: number, boardId: number){
    return this.http.delete(`${this.url}/Tasks/${id}/${boardId}`, {
      headers: this.headers()
    });
  }
  forgotPassword(email: string) {
  return this.http.post(`${this.url}/Auth/forgot-password`, { email }, { responseType: 'text' });
}

resetPassword(token: string, newPassword: string) {
  return this.http.post(`${this.url}/Auth/reset-password`, { token, newPassword }, { responseType: 'text' });
}
  updateTask(task: Task) {
  return this.http.put<Task>(`${this.url}/Tasks`, {
    id: task.id,
    title: task.title,
    assignedTo: task.assignedTo,
    description: task.description,
    status: task.status,
    order: task.order,
    boardId: task.boardId,
    Note: task.note,
    Points: task.points,
    DueDate: task.dueDate
  }, {
    headers: this.headers()
  });
}
  getUserTasks(username: string){
    return this.http.get<Task[]>(`${this.url}/Tasks/user/${username}`, {
      headers: this.headers()
    });
  }
  
}
