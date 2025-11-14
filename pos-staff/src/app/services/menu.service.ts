import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, MenuResponse } from '../models/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // Angular Signals for reactive state
  menuItems = signal<MenuItem[]>([]);
  loading = signal(false);

  // BehaviorSubject for RxJS compatibility
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  public menuItems$ = this.menuItemsSubject.asObservable();

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
    this.menuItemsSubject.next(items);
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems().find(item => item.id === id);
  }

  updateMenuItemStock(id: string, remainingStock: number): void {
    const items = this.menuItems();
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, remaining_stock: remainingStock } : item
    );
    this.setMenuItems(updatedItems);
  }
}

