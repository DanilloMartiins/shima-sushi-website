import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AddressRequest, AddressResponse } from '../models/address.models';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/addresses`;

  // Busca todos os endereços do usuário
  getMyAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(this.apiUrl);
  }

  // Pega o endereço marcado como padrão
  getDefaultAddress(): Observable<AddressResponse | null> {
    return this.http.get<AddressResponse | null>(`${this.apiUrl}/default`);
  }

  // Busca dados do CEP via API externa gratuita
  lookupCep(cep: string): Observable<any> {
    const cleanCep = cep.replace(/\D/g, '');
    return this.http.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
  }

  // Salva um novo endereço ou atualiza um existente
  saveAddress(request: AddressRequest, id?: number): Observable<AddressResponse> {
    if (id) {
      return this.http.put<AddressResponse>(`${this.apiUrl}/${id}`, request);
    }
    return this.http.post<AddressResponse>(this.apiUrl, request);
  }

  // Remove um endereço pelo ID
  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
