import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MenuService } from '@core/services/menu.service';
import { MenuCategoryResponse } from '@core/models/menu.models';
import { MenuListComponent } from './menu-list.component';
import { HeaderComponent } from '@app/layout/header.component';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MenuListComponent],
  template: `
    <app-header></app-header>
    <main class="menu-page">
      @if (categories$ | async; as categories) {
        <app-menu-list [categories]="categories"></app-menu-list>
      } @else {
        <div class="loading">Carregando cardápio incrível do Seu Shima Sushi...</div>
      }
    </main>
  `
})
export class MenuPageComponent implements OnInit {
  private menuService = inject(MenuService);

  categories$!: Observable<MenuCategoryResponse[]>;

  ngOnInit(): void {
    this.categories$ = this.menuService.getPublicMenu();
  }
}