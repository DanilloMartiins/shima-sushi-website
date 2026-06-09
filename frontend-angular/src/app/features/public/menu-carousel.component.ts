import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoriaCarrossel {
  slug: string;
  nome: string;
}

@Component({
  selector: 'app-menu-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="carousel-container">
      <button
        class="carousel-btn carousel-btn--prev"
        (click)="rolar(-1)"
        [class.carousel-btn--hidden]="!podeVoltar()"
        aria-label="Anterior"
      >
        &lsaquo;
      </button>

      <div class="carousel-track" #trackRef>
        <button
          *ngFor="let cat of categorias; trackBy: trackCategoria"
          class="carousel-item"
          [class.carousel-item--active]="cat.slug === ativa"
          (click)="selecionar(cat.slug)"
        >
          {{ cat.nome }}
        </button>
      </div>

      <button
        class="carousel-btn carousel-btn--next"
        (click)="rolar(1)"
        [class.carousel-btn--hidden]="!podeAvancar()"
        aria-label="Próximo"
      >
        &rsaquo;
      </button>
    </nav>
  `,
  styles: [`
    .carousel-container {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: #fff;
      padding: 0.5rem 0;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--brand-border, #e0ddd5);
    }

    .carousel-track {
      display: flex;
      gap: 0.4rem;
      -webkit-overflow-scrolling: touch;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      flex: 1;
      padding: 0.15rem 0;
    }

    .carousel-track::-webkit-scrollbar {
      display: none;
    }

    .carousel-item {
      flex-shrink: 0;
      border: 1px solid var(--brand-border, #e0ddd5);
      border-radius: 999px;
      background: transparent;
      padding: 0.3rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--brand-muted, #888);
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }

    .carousel-item:hover {
      background: rgba(234, 106, 61, 0.06);
      color: var(--brand-ink, #171214);
    }

    .carousel-item--active {
      background: var(--brand-orange, #ea6a3d);
      color: #fff;
      border-color: var(--brand-orange, #ea6a3d);
    }

    .carousel-btn {
      flex-shrink: 0;
      border: 1px solid var(--brand-border, #e0ddd5);
      border-radius: 50%;
      background: #fff;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      color: var(--brand-ink, #171214);
      transition: background 0.15s, opacity 0.2s;
    }

    .carousel-btn:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .carousel-btn--hidden {
      opacity: 0;
      pointer-events: none;
    }
  `],
})
export class MenuCarouselComponent {
  readonly elementRef = inject(ElementRef<HTMLElement>);

  @ViewChild('trackRef') trackRef!: ElementRef<HTMLElement>;

  @Input({ required: true }) categorias: CategoriaCarrossel[] = [];
  @Input() ativa = '';
  @Output() categoriaChange = new EventEmitter<string>();

  trackCategoria(_: number, cat: CategoriaCarrossel): string {
    return cat.slug;
  }

  selecionar(slug: string): void {
    this.categoriaChange.emit(slug);
  }

  podeVoltar(): boolean {
    const t = this.trackRef?.nativeElement;
    if (!t) return false;
    return t.scrollLeft > 4;
  }

  podeAvancar(): boolean {
    const t = this.trackRef?.nativeElement;
    if (!t) return false;
    return t.scrollLeft + t.clientWidth < t.scrollWidth - 4;
  }

  rolar(direcao: number): void {
    const t = this.trackRef?.nativeElement;
    if (!t) return;
    t.scrollBy({ left: direcao * 180, behavior: 'smooth' });
  }
}
