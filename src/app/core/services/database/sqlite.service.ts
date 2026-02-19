import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  capSQLiteSet,
} from '@capacitor-community/sqlite';
import { Book } from '../../models/books/book.model';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.init();
  }

  async ensureReady() {
    await this.isReady;
  }

  private async init(): Promise<void> {
    try {
      // Configuración Web y detección de entorno
      try {
        await this.sqlite.initWebStore();
      } catch {
        console.log('Nativo detectado');
      }

      const existing = await this.sqlite.isConnection('books.db', false);
      if (existing.result) {
        this.db = await this.sqlite.retrieveConnection('books.db', false);
      } else {
        this.db = await this.sqlite.createConnection(
          'books.db',
          false,
          'no-encryption',
          1,
          false,
        );
      }

      await this.db.open();

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          data TEXT
        );
      `);
      console.log('SQLite: Base de Datos y Tabla books listas');
    } catch (error) {
      console.error('Error inicializando SQLite:', error);
    }
  }

  async saveBooks(books: Book[]): Promise<void> {
    await this.ensureReady();
    const set: capSQLiteSet[] = books.map((b) => ({
      statement: `INSERT OR REPLACE INTO books (id, data) VALUES (?, ?)`,
      values: [b.id, JSON.stringify(b)],
    }));
    await this.db.executeSet(set);
  }

  async getAllBooks(): Promise<Book[]> {
    await this.ensureReady();
    const res = await this.db.query(`SELECT data FROM books`);
    if (!res.values) return [];
    return res.values.map((r) => JSON.parse(r.data));
  }

  async clearBooks(): Promise<void> {
    await this.ensureReady();
    await this.db.execute(`DELETE FROM books`);
  }
}
