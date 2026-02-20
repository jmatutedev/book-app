import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book } from '../../models/books/book.model';

const BASE_URL = 'https://openlibrary.org';
const PAGE_SIZE = 20;

@Injectable({
  providedIn: 'root',
})
export class OpenLibraryService {
  constructor(private http: HttpClient) {}

  /**
   * Libros por género (subject).
   * Endpoint: /subjects/{genre}.json?limit=20&offset=N
   */
  async fetchBooksByGenre(genreId: string, page: number): Promise<Book[]> {
    const offset = (page - 1) * PAGE_SIZE;
    const url = `${BASE_URL}/subjects/${genreId}.json?limit=${PAGE_SIZE}&offset=${offset}`;

    const res = await firstValueFrom(this.http.get<{ works: any[] }>(url));

    return (res.works ?? []).map(this.mapToBook);
  }

  /**
   * Búsqueda general de libros.
   * Endpoint: /search.json?q={query}&page=N&limit=20
   */
  async searchBooks(query: string, page: number): Promise<Book[]> {
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${PAGE_SIZE}`;

    const res = await firstValueFrom(this.http.get<{ docs: any[] }>(url));

    return (res.docs ?? []).map(this.mapSearchDocToBook);
  }

  /**
   * Detalle de un libro por su key de works.
   * Endpoint: /works/{id}.json
   */
  async fetchBookDetail(bookId: string): Promise<Book> {
    // bookId puede venir como "/works/OL45804W" o solo "OL45804W"
    const path = bookId.startsWith('/works/') ? bookId : `/works/${bookId}`;
    const url = `${BASE_URL}${path}.json`;

    const res = await firstValueFrom(this.http.get<any>(url));

    return {
      id: res.key,
      title: res.title,
      authors: [], // el detalle requiere llamadas extra a /authors; se resuelve en la página si se necesita
      cover_id: res.covers?.[0],
      description:
        typeof res.description === 'string'
          ? res.description
          : res.description?.value,
    };
  }

  // ─── Mappers privados ─────────────────────────────────────────────────────────

  /**
   * Respuesta de /subjects → Book
   */
  private mapToBook(work: any): Book {
    return {
      id: work.key,
      title: work.title,
      authors: work.authors?.map((a: any) => a.name) ?? [],
      cover_id: work.cover_id,
      first_publish_year: work.first_publish_year,
    };
  }

  /**
   * Respuesta de /search.json → Book
   * La estructura de los docs de búsqueda es distinta a la de subjects
   */
  private mapSearchDocToBook(doc: any): Book {
    return {
      id: doc.key,
      title: doc.title,
      authors: doc.author_name ?? [],
      cover_id: doc.cover_i,
      first_publish_year: doc.first_publish_year,
    };
  }
}
