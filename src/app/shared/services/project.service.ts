import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { Projects } from '../../interfaces/projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  private readonly projects$ = this.http
    .get<Projects[]>('assets/data/projects.json')
    .pipe(
      catchError(() => of([] as Projects[])),
      shareReplay(1)
    );

  getProjects(): Observable<Projects[]> {
    return this.projects$;
  }
}
