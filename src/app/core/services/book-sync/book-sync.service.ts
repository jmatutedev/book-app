import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { OpenLibraryService } from '../api/open-library.service';
import { NetworkService } from '../network/network.service';
import { Book } from '../../models/books/book.model';
import { StorageFacadeService } from '../storage/storage-facade.service';
import { toWorkKey } from '../../utils/open-library-id.util';

const PAGE_SIZE = 20;

@Injectable({
  providedIn: 'root',
})
export class BookSyncService {
  private readonly isNative = Capacitor.isNativePlatform();
  private genreCache = new Map<string, Book[]>();
  private detailCache = new Map<string, Book>();

  constructor(
    private api: OpenLibraryService,
    private storage: StorageFacadeService,
    private network: NetworkService,
  ) {}

  async getBooksByGenre(genreId: string, page: number): Promise<Book[]> {
    if (await this.isOnlineSafe()) {
      const key = `${genreId}_${page}`;
      if (this.genreCache.has(key)) return this.genreCache.get(key)!;
      const books = await this.api.fetchBooksByGenre(genreId, page);
      this.genreCache.set(key, books);
      if (this.isNative) await this.storage.saveBooksForGenre(genreId, books);
      return books;
    }

    if (this.isNative) {
      const allBooks = await this.storage.getBooksByGenre(genreId);
      const offset = (page - 1) * PAGE_SIZE;
      return allBooks.slice(offset, offset + PAGE_SIZE);
    }
    return [];
  }

  async searchBooks(query: string, page: number): Promise<Book[]> {
    if (!(await this.isOnlineSafe())) {
      throw new Error('Sin conexión. La búsqueda requiere internet.');
    }
    const books = await this.api.searchBooks(query, page);
    if (this.isNative) await this.storage.saveBooks(books);
    return books;
  }

  async getBookDetail(bookId: string): Promise<Book | null> {
    const workKey = toWorkKey(bookId);
    if (this.detailCache.has(workKey)) return this.detailCache.get(workKey)!;

    if (await this.isOnlineSafe()) {
      try {
        const book = await this.api.fetchBookDetail(workKey);
        if (this.isNative) await this.storage.saveBook(book);
        this.detailCache.set(workKey, book);
        return book;
      } catch (error) {
        console.warn('No se pudo obtener el detalle desde API. Se intenta fallback local.', error);
      }
    }

    if (this.isNative) return this.storage.getBookById(workKey);
    return null;
  }

  private async isOnlineSafe(): Promise<boolean> {
    await this.network.ready;
    return this.network.isOnline();
  }
}
