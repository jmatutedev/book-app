import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const DB_NAME = 'books_app.db';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;

  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    // En web no se inicializa nada
    if (!Capacitor.isNativePlatform()) return;

    const existing = await this.sqlite.isConnection(DB_NAME, false);
    this.db = existing.result
      ? await this.sqlite.retrieveConnection(DB_NAME, false)
      : await this.sqlite.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          1,
          false,
        );

    await this.db.open();
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id   TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS genre_books (
        genre_id TEXT NOT NULL,
        book_id  TEXT NOT NULL,
        PRIMARY KEY (genre_id, book_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_lists (
        id   TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS list_books (
        list_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        PRIMARY KEY (list_id, book_id),
        FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      );
    `);
  }

  isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  getDb(): SQLiteDBConnection {
    return this.db;
  }
}
