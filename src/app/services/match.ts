import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Match {
  _id?: string;
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
  date: Date;
  userId: string;
}

export interface TeamStats {
  team: string[];
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  matches: number;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
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

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/matches`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Erro ao carregar partidas:', error);
          return of([]);
        })
      );
  }

  createMatch(match: Match): Observable<Match> {
    return this.http.post<Match>(`${this.apiUrl}/matches`, match, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Erro ao criar partida:', error);
          throw error;
        })
      );
  }

  getStats(): Observable<TeamStats[]> {
    return this.http.get<TeamStats[]>(`${this.apiUrl}/stats`, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.log('Erro ao carregar estatísticas:', error);
          return of([]);
        })
      );
  }
}