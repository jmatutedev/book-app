import { Injectable } from '@angular/core';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { Book } from '../../models/books/book.model';
import {
  canCreateMoreLists,
  validateListName,
} from '../../utils/list-name-validation.util';

const LISTS_KEY = 'custom_lists';
const BOOKS_PREFIX = 'list_books_';

@Injectable({
  providedIn: 'root',
})
export class LocalListsService {
  async getLists(): Promise<CustomList[]> {
    const raw = localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async createList(list: CustomList): Promise<void> {
    const lists = await this.getLists();

    if (!canCreateMoreLists(lists)) {
      throw new Error('No puedes crear más de 3 listas.');
    }

    const validationError = validateListName(list.name, lists);
    if (validationError) throw new Error(validationError);

    lists.push({ ...list, name: list.name.trim() });
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  async updateListName(listId: string, newName: string): Promise<void> {
    const lists = await this.getLists();

    const validationError = validateListName(newName, lists, listId);
    if (validationError) throw new Error(validationError);

    const updatedLists = lists.map((list) =>
      list.id === listId ? { ...list, name: newName.trim() } : list,
    );
    localStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
  }

  async deleteList(listId: string): Promise<void> {
    const lists = (await this.getLists()).filter((list) => list.id !== listId);
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    localStorage.removeItem(`${BOOKS_PREFIX}${listId}`);
  }

  async getBooksInList(listId: string): Promise<Book[]> {
    const raw = localStorage.getItem(`${BOOKS_PREFIX}${listId}`);
    return raw ? JSON.parse(raw) : [];
  }

  async addBookToList(listId: string, book: Book): Promise<void> {
    const books = await this.getBooksInList(listId);
    if (books.some((entry) => entry.id === book.id)) return;

    books.push(book);
    localStorage.setItem(`${BOOKS_PREFIX}${listId}`, JSON.stringify(books));
  }

  async removeBookFromList(listId: string, bookId: string): Promise<void> {
    const books = (await this.getBooksInList(listId)).filter(
      (entry) => entry.id !== bookId,
    );
    localStorage.setItem(`${BOOKS_PREFIX}${listId}`, JSON.stringify(books));
  }

  async isBookInList(listId: string, bookId: string): Promise<boolean> {
    return (await this.getBooksInList(listId)).some(
      (entry) => entry.id === bookId,
    );
  }
}

