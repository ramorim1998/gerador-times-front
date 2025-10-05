import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // ← Adicionar
import { environment } from '../../environments/environment'; // ← Adicionar

interface GroupMember {
  name: string;
  active: boolean;
}

interface Group {
  _id?: string;
  name: string;
  members: GroupMember[];
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/groups`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Backend offline ou não autenticado, usando localStorage');
          return of(this.getLocalGroups());
        })
      );
  }

  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/groups`, group, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Backend offline, salvando localmente');
          const localGroup = this.createLocalGroup(group);
          return of(localGroup);
        })
      );
  }

  updateGroup(id: string, group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/groups/${id}`, group, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Backend offline, atualizando localmente');
          this.updateLocalGroup(id, group);
          return of(group);
        })
      );
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${id}`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Backend offline, deletando localmente');
          this.deleteLocalGroup(id);
          return of({ message: 'Deletado localmente' });
        })
      );
  }

  private getLocalGroups(): Group[] {
    const saved = localStorage.getItem('teamGroups');
    return saved ? JSON.parse(saved) : [];
  }

  private createLocalGroup(group: Group): Group {
    const groups = this.getLocalGroups();
    const newGroup = { ...group, _id: Date.now().toString() };
    groups.push(newGroup);
    localStorage.setItem('teamGroups', JSON.stringify(groups));
    return newGroup;
  }

  private updateLocalGroup(id: string, group: Group): void {
    const groups = this.getLocalGroups();
    const index = groups.findIndex(g => g._id === id);
    if (index !== -1) {
      groups[index] = group;
      localStorage.setItem('teamGroups', JSON.stringify(groups));
    }
  }

  private deleteLocalGroup(id: string): void {
    const groups = this.getLocalGroups();
    const filtered = groups.filter(g => g._id !== id);
    localStorage.setItem('teamGroups', JSON.stringify(filtered));
  }
}