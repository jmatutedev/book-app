import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Book } from '../../models/books/book.model';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { BooksDbService } from '../database/books-db.service';
import { CustomListsDbService } from '../database/custom-list-db.service';
import { LocalListsService } from '../web-list/web-lists.service';
import { toWorkKey } from '../../utils/open-library-id.util';

@Injectable({
  providedIn: 'root',
})
export class StorageFacadeService {
  private readonly isNative = Capacitor.isNativePlatform();

  constructor(
    private booksDb: BooksDbService,
    private customListsDb: CustomListsDbService,
    private localLists: LocalListsService,
  ) {}

  async saveBooksForGenre(genreId: string, books: Book[]): Promise<void> {
    if (!this.isNative) return;
    await this.booksDb.saveBooksForGenre(genreId, books);
  }

  async getBooksByGenre(genreId: string): Promise<Book[]> {
    if (!this.isNative) return [];
    return this.booksDb.getBooksByGenre(genreId);
  }

  async getBookById(bookId: string): Promise<Book | null> {
    if (!this.isNative) return null;
    return this.booksDb.getBookById(toWorkKey(bookId));
  }

  async saveBook(book: Book): Promise<void> {
    if (!this.isNative) return;
    await this.booksDb.saveBooks([{ ...book, id: toWorkKey(book.id) }]);
  }

  async getLists(): Promise<CustomList[]> {
    if (this.isNative) return this.customListsDb.getLists();
    return this.localLists.getLists();
  }

  async createList(list: CustomList): Promise<void> {
    if (this.isNative) return this.customListsDb.createList(list);
    return this.localLists.createList(list);
  }

  async updateListName(listId: string, newName: string): Promise<void> {
    if (this.isNative) return this.customListsDb.updateListName(listId, newName);
    return this.localLists.updateListName(listId, newName);
  }

  async deleteList(listId: string): Promise<void> {
    if (this.isNative) return this.customListsDb.deleteList(listId);
    return this.localLists.deleteList(listId);
  }

  async getBooksInList(listId: string): Promise<Book[]> {
    if (this.isNative) return this.customListsDb.getBooksInList(listId);
    return this.localLists.getBooksInList(listId);
  }

  async addBookToList(listId: string, book: Book): Promise<void> {
    const normalizedBook = { ...book, id: toWorkKey(book.id) };
    if (this.isNative) return this.customListsDb.addBookToList(listId, normalizedBook);
    return this.localLists.addBookToList(listId, normalizedBook);
  }

  async removeBookFromList(listId: string, bookId: string): Promise<void> {
    const normalizedBookId = toWorkKey(bookId);
    if (this.isNative) {
      return this.customListsDb.removeBookFromList(listId, normalizedBookId);
    }
    return this.localLists.removeBookFromList(listId, normalizedBookId);
  }

  async isBookInList(listId: string, bookId: string): Promise<boolean> {
    const normalizedBookId = toWorkKey(bookId);
    if (this.isNative) return this.customListsDb.isBookInList(listId, normalizedBookId);
    return this.localLists.isBookInList(listId, normalizedBookId);
  }
}
