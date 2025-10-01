import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private apiUrl = 'https://gerador-times-back.up.railway.app';

  getGroups(userId: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/groups?userId=${userId}`)
      .pipe(
        catchError(error => {
          console.log('Backend offline, usando localStorage');
          return of(this.getLocalGroups());
        })
      );
  }

  createGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/groups`, group)
      .pipe(
        catchError(error => {
          console.log('Backend offline, salvando localmente');
          const localGroup = this.createLocalGroup(group);
          return of(localGroup);
        })
      );
  }

  updateGroup(id: string, group: Group): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/groups/${id}`, group)
      .pipe(
        catchError(error => {
          console.log('Backend offline, atualizando localmente');
          this.updateLocalGroup(id, group);
          return of(group);
        })
      );
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${id}`)
      .pipe(
        catchError(error => {
          console.log('Backend offline, deletando localmente');
          this.deleteLocalGroup(id);
          return of({ message: 'Deletado localmente' });
        })
      );
  }

  // Fallback para localStorage
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