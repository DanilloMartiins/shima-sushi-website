import { MenuCategoryResponse, ProductResponse } from '@core/models/menu.models';
import { CATEGORY_DISPLAY_ORDER, getCategoryDisplay } from '@core/config/menu.config';

function trimNome(nome: string): string {
  return nome.trim();
}

function corrigirGeleia(nome: string): string {
  return nome.replace(/Geléia/g, 'Geleia');
}

function corrigirHotShima(categoria: string, nome: string): string {
  if (
    categoria.toLowerCase().includes('hot') &&
    nome.toLowerCase().trim() === 'shima'
  ) {
    return 'Hot Shima';
  }
  return nome;
}

function descricaoIgualAoNome(produto: ProductResponse): string {
  if (
    produto.description &&
    produto.description.trim().toLowerCase() === produto.name.trim().toLowerCase()
  ) {
    return '';
  }
  return produto.description;
}

function sanitizarProduto(
  produto: ProductResponse,
  nomeCategoria: string,
): ProductResponse {
  const nomeLimpo = corrigirHotShima(
    nomeCategoria,
    corrigirGeleia(trimNome(produto.name)),
  );

  return {
    ...produto,
    name: nomeLimpo,
    description: descricaoIgualAoNome({
      ...produto,
      name: nomeLimpo,
    }),
  };
}

function sanitizarCategoria(
  categoria: MenuCategoryResponse,
): MenuCategoryResponse {
  const display = getCategoryDisplay(categoria.name);

  return {
    ...categoria,
    name: display.name,
    description: categoria.description?.trim() ?? '',
    products: categoria.products.map((p) =>
      sanitizarProduto(p, display.name),
    ),
  };
}

export function sanitizarCardapio(
  categorias: MenuCategoryResponse[],
): MenuCategoryResponse[] {
  const mapeadas = sanitizarCategoria;

  const mapaOrdem = new Map<string, number>();
  for (const config of CATEGORY_DISPLAY_ORDER) {
    mapaOrdem.set(config.name.toLowerCase(), config.order);
  }

  const ordenadas: (MenuCategoryResponse | null)[] = [];
  const semOrdem: MenuCategoryResponse[] = [];

  for (const cat of categorias) {
    const sanitizada = sanitizarCategoria(cat);
    const ordem = mapaOrdem.get(sanitizada.name.toLowerCase());

    if (ordem !== undefined) {
      ordenadas[ordem] = sanitizada;
    } else {
      semOrdem.push(sanitizada);
    }
  }

  const resultado = ordenadas.filter((c): c is MenuCategoryResponse => c !== null);
  resultado.push(...semOrdem);

  return resultado;
}

export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .replace(/&/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
