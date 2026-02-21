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

    const statements = books.map((book) => ({
      statement: `INSERT OR REPLACE INTO books (id, data) VALUES (?, ?)`,
      values: [
        toWorkKey(book.id),
        JSON.stringify({ ...book, id: toWorkKey(book.id) }),
      ],
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
       WHERE gb.genre_id = ?`,
      [genreId],
    );
    if (!res.values?.length) return [];
    return res.values.map((row) => JSON.parse(row.data));
  }
}
