import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  
  // Endpoint específico que você pediu
  private apiUrl = 'http://localhost:8080/api/produtos';

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Erro na API de produtos:', error);
        return throwError(() => new Error('Não foi possível carregar o cardápio'));
      })
    );
  }
}
