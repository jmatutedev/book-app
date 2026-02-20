import { Injectable } from '@angular/core';
import { DatabaseService } from './sqlite.service';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { Book } from '../../models/books/book.model';

const MAX_LISTS = 3;

@Injectable({
  providedIn: 'root',
})
export class CustomListsDbService {
  constructor(private databaseService: DatabaseService) {}

  async getLists(): Promise<CustomList[]> {
    if (!this.databaseService.isAvailable()) return [];
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(`SELECT id, name FROM custom_lists`);
    if (!res.values?.length) return [];
    return res.values.map((row) => ({ id: row.id, name: row.name }));
  }

  async createList(list: CustomList): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const count = await db.query(`SELECT COUNT(*) as total FROM custom_lists`);
    const total = count.values?.[0]?.total ?? 0;
    if (total >= MAX_LISTS)
      throw new Error(`No puedes crear más de ${MAX_LISTS} listas.`);

    await db.run(`INSERT INTO custom_lists (id, name) VALUES (?, ?)`, [
      list.id,
      list.name.trim(),
    ]);
  }

  async updateListName(listId: string, newName: string): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();
    await db.run(`UPDATE custom_lists SET name = ? WHERE id = ?`, [
      newName.trim(),
      listId,
    ]);
  }

  async deleteList(listId: string): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();
    await db.run(`DELETE FROM custom_lists WHERE id = ?`, [listId]);
  }

  async getBooksInList(listId: string): Promise<Book[]> {
    if (!this.databaseService.isAvailable()) return [];
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(
      `SELECT b.data FROM books b
       INNER JOIN list_books lb ON b.id = lb.book_id
       WHERE lb.list_id = ?`,
      [listId],
    );
    if (!res.values?.length) return [];
    return res.values.map((row) => JSON.parse(row.data));
  }

  async addBookToList(listId: string, book: Book): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    await db.run(`INSERT OR IGNORE INTO books (id, data) VALUES (?, ?)`, [
      book.id,
      JSON.stringify(book),
    ]);
    await db.run(
      `INSERT OR IGNORE INTO list_books (list_id, book_id) VALUES (?, ?)`,
      [listId, book.id],
    );
  }

  async removeBookFromList(listId: string, bookId: string): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();
    await db.run(`DELETE FROM list_books WHERE list_id = ? AND book_id = ?`, [
      listId,
      bookId,
    ]);
  }

  async isBookInList(listId: string, bookId: string): Promise<boolean> {
    if (!this.databaseService.isAvailable()) return false;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(
      `SELECT 1 FROM list_books WHERE list_id = ? AND book_id = ? LIMIT 1`,
      [listId, bookId],
    );
    return (res.values?.length ?? 0) > 0;
  }
}
