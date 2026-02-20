import { Injectable } from '@angular/core';
import { OpenLibraryService } from '../api/open-library.service';
import { BooksDbService } from '../database/books-db.service';
import { NetworkService } from '../network/network.service';
import { Book } from '../../models/books/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookSyncService {
  private genreCache = new Map<string, Book[]>();
  private detailCache = new Map<string, Book>();

  constructor(
    private api: OpenLibraryService,
    private booksDb: BooksDbService,
    private network: NetworkService,
  ) {}

  async getBooksByGenre(genreId: string, page: number): Promise<Book[]> {
    const key = `${genreId}_${page}`;
    if (this.genreCache.has(key)) return this.genreCache.get(key)!;

    if (this.network.isOnline()) {
      const books = await this.api.fetchBooksByGenre(genreId, page);
      this.genreCache.set(key, books);
      await this.booksDb.saveBooksForGenre(genreId, books);
      return books;
    }

    return this.booksDb.getBooksByGenre(genreId);
  }

  async searchBooks(query: string, page: number): Promise<Book[]> {
    if (!this.network.isOnline()) {
      throw new Error('Sin conexión. La búsqueda requiere internet.');
    }
    return this.api.searchBooks(query, page);
  }

  async getBookDetail(bookId: string): Promise<Book | null> {
    if (this.detailCache.has(bookId)) return this.detailCache.get(bookId)!;

    if (this.network.isOnline()) {
      try {
        const book = await this.api.fetchBookDetail(bookId);
        this.detailCache.set(bookId, book);
        return book;
      } catch {
        // Si la API falla caemos a SQLite
      }
    }

    return this.booksDb.getBookById(bookId);
  }
}
