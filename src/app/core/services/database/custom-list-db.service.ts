import { Injectable } from '@angular/core';
import { DatabaseService } from './sqlite.service';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { Book } from '../../models/books/book.model';
import {
  canCreateMoreLists,
  validateListName,
} from '../../utils/list-name-validation.util';

@Injectable({
  providedIn: 'root',
})
export class CustomListsDbService {
  private listsCache: CustomList[] | null = null;

  constructor(private databaseService: DatabaseService) {}

  async getLists(): Promise<CustomList[]> {
    if (!this.databaseService.isAvailable()) return [];
    if (this.listsCache) return [...this.listsCache];
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const res = await db.query(`SELECT id, name FROM custom_lists`);
    if (!res.values?.length) return [];
    const lists = res.values.map((row) => ({ id: row.id, name: row.name }));
    this.listsCache = lists;
    return [...lists];
  }

  async createList(list: CustomList): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const lists = await this.getLists();
    if (!canCreateMoreLists(lists)) {
      throw new Error('No puedes crear más de 3 listas.');
    }

    const validationError = validateListName(list.name, lists);
    if (validationError) throw new Error(validationError);

    await db.run(`INSERT INTO custom_lists (id, name) VALUES (?, ?)`, [
      list.id,
      list.name.trim(),
    ]);
    this.listsCache = null;
  }

  async updateListName(listId: string, newName: string): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();

    const lists = await this.getLists();
    const validationError = validateListName(newName, lists, listId);
    if (validationError) throw new Error(validationError);

    await db.run(`UPDATE custom_lists SET name = ? WHERE id = ?`, [
      newName.trim(),
      listId,
    ]);
    this.listsCache = null;
  }

  async deleteList(listId: string): Promise<void> {
    if (!this.databaseService.isAvailable()) return;
    await this.databaseService.ready;
    const db = this.databaseService.getDb();
    await db.run(`DELETE FROM custom_lists WHERE id = ?`, [listId]);
    this.listsCache = null;
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
