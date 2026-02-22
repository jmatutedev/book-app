import { Injectable } from '@angular/core';
import { DatabaseService } from './sqlite.service';
import { Book } from '../../models/books/book.model';
import { toWorkKey } from '../../utils/open-library-id.util';

@Injectable({
  providedIn: 'root',
})
export class BooksDbService {
  constructor(private databaseService: DatabaseService) {}

  async saveBooks(books: Book[]): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const statements = await Promise.all(books.map(async (book) => {
      const normalizedId = toWorkKey(book.id);
      const existing = await this.getStoredBookData(normalizedId);
      const merged = this.mergeBookData(existing, {
        ...book,
        id: normalizedId,
      });

      return {
      statement: `
        INSERT INTO books (id, data) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data
      `,
      values: [
        normalizedId,
        JSON.stringify(merged),
      ],
      };
    }));
    await db.executeSet(statements);
  }

  async getBookById(bookId: string): Promise<Book | null> {
    if (!this.databaseService.isAvailable()) return null;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(`SELECT data FROM books WHERE id = ?`, [
      toWorkKey(bookId),
    ]);
    if (!res.values?.length) return null;
    return JSON.parse(res.values[0].data);
  }

  async saveBooksForGenre(genreId: string, books: Book[]): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.saveBooks(books);
    const db = this.databaseService.getDb();

    const relations = books.map((book) => ({
      statement: `INSERT OR IGNORE INTO genre_books (genre_id, book_id) VALUES (?, ?)`,
      values: [genreId, toWorkKey(book.id)],
    }));
    await db.executeSet(relations);
  }

  async getBooksByGenre(genreId: string): Promise<Book[]> {
    if (!this.databaseService.isAvailable()) return [];
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(
      `SELECT b.data FROM books b
       INNER JOIN genre_books gb ON b.id = gb.book_id
       WHERE gb.genre_id = ?
       ORDER BY gb.rowid ASC`,
      [genreId],
    );
    if (!res.values?.length) return [];
    return res.values.map((row) => JSON.parse(row.data));
  }

  private async getStoredBookData(bookId: string): Promise<Book | null> {
    const db = this.databaseService.getDb();
    const res = await db.query(`SELECT data FROM books WHERE id = ?`, [bookId]);
    if (!res.values?.length) return null;
    return JSON.parse(res.values[0].data);
  }

  private mergeBookData(existing: Book | null, incoming: Book): Book {
    if (!existing) return incoming;

    return {
      ...existing,
      ...incoming,
      id: incoming.id,
      title: incoming.title || existing.title,
      authors:
        incoming.authors && incoming.authors.length
          ? incoming.authors
          : existing.authors,
      cover_id: incoming.cover_id ?? existing.cover_id,
      first_publish_year:
        incoming.first_publish_year ?? existing.first_publish_year,
      description: incoming.description ?? existing.description,
    };
  }
}
