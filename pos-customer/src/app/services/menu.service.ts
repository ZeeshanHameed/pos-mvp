import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MenuItem, MenuResponse } from '../models/menu.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // Angular Signals for reactive state
  menuItems = signal<MenuItem[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  loadMenu(): Observable<MenuResponse> {
    this.loading.set(true);
    return this.http.get<MenuResponse>(`${environment.apiUrl}/menu`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setMenuItems(response.data.items);
        }
        this.loading.set(false);
      })
    );
  }

  private setMenuItems(items: MenuItem[]): void {
    this.menuItems.set(items);
  }

  getAvailableItems(): MenuItem[] {
    return this.menuItems().filter(item => item.remaining_stock > 0);
  }
}

