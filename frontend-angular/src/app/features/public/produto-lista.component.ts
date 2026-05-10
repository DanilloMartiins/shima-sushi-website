import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProdutoService } from '../../core/services/produto.service';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-produto-lista',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>Nosso Cardápio</h2>
        <button (click)="carregarProdutos()" [disabled]="loading()">
          {{ loading() ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>

      <!-- Loading Spinner -->
      @if (loading()) {
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Carregando as delícias...</p>
        </div>
      }

      <!-- Erro na API -->
      @if (errorMessage()) {
        <div class="error-message">
          <p>Ops! {{ errorMessage() }}</p>
          <button (click)="carregarProdutos()">Tentar novamente</button>
        </div>
      }

      <!-- Lista de Produtos -->
      @if (!loading() && !errorMessage()) {
        
        @if (produtos().length > 0) {
          <div class="grid-produtos">
            <!-- Usando track robusto com combinação de campos -->
            @for (produto of produtos(); track produto.nome + '-' + produto.preco) {
              <article class="card">
                
                <img 
                  [src]="produto.urlImagem || 'assets/sem-imagem.png'" 
                  [alt]="produto.nome"
                  loading="lazy"
                  class="card-img"
                  (error)="onImageError($event)"
                />
                
                <div class="card-info">
                  <h3>{{ produto.nome }}</h3>
                  <p class="preco">{{ produto.preco | currency:'BRL' }}</p>
                </div>
              </article>
            }
          </div>
        } @else {
          <!-- Lista Vazia Separada -->
          <div class="empty-state">
            <p>Cardápio indisponível no momento. 😔</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: sans-serif;
    }

    h2 {
      text-align: center;
      color: #333;
    }

    .grid-produtos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .card {
      border: 1px solid #eee;
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s ease-in-out;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }

    .card-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }

    .card-info {
      padding: 15px;
      text-align: center;
    }

    .card-info h3 {
      margin: 0 0 10px;
      font-size: 1.1rem;
      color: #222;
    }

    .preco {
      font-weight: bold;
      color: #e65100;
      font-size: 1.2rem;
      margin: 0;
    }

    .loading-spinner, .error-message, .empty-state {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #e65100;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      color: #d32f2f;
      background: #ffebee;
      border-radius: 8px;
    }

    button {
      background: #e65100;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 10px;
    }
  `]
})
export class ProdutoListaComponent implements OnInit {
  private produtoService = inject(ProdutoService);

  produtos = signal<Produto[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.carregarProdutos();
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/sem-imagem.png';
  }

  carregarProdutos() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.produtoService.getProdutos().subscribe({
      next: (dados) => {
        this.produtos.set(dados);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
