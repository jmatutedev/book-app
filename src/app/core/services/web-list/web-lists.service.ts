import { Injectable } from '@angular/core';
import { CustomList } from '../../models/custom-list/custom-list.model';
import { Book } from '../../models/books/book.model';

const LISTS_KEY = 'custom_lists';
const BOOKS_PREFIX = 'list_books_';
const MAX_LISTS = 3;

@Injectable({
  providedIn: 'root',
})
export class LocalListsService {
  getLists(): CustomList[] {
    const raw = localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  createList(list: CustomList): void {
    const lists = this.getLists();
    if (lists.length >= MAX_LISTS)
      throw new Error('Límite de listas alcanzado.');
    lists.push(list);
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  updateListName(listId: string, newName: string): void {
    const lists = this.getLists().map((l) =>
      l.id === listId ? { ...l, name: newName } : l,
    );
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }

  deleteList(listId: string): void {
    const lists = this.getLists().filter((l) => l.id !== listId);
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    localStorage.removeItem(`${BOOKS_PREFIX}${listId}`);
  }

  getBooksInList(listId: string): Book[] {
    const raw = localStorage.getItem(`${BOOKS_PREFIX}${listId}`);
    return raw ? JSON.parse(raw) : [];
  }

  addBookToList(listId: string, book: Book): void {
    const books = this.getBooksInList(listId);
    if (books.some((b) => b.id === book.id)) return;
    books.push(book);
    localStorage.setItem(`${BOOKS_PREFIX}${listId}`, JSON.stringify(books));
  }

  removeBookFromList(listId: string, bookId: string): void {
    const books = this.getBooksInList(listId).filter((b) => b.id !== bookId);
    localStorage.setItem(`${BOOKS_PREFIX}${listId}`, JSON.stringify(books));
  }

  isBookInList(listId: string, bookId: string): boolean {
    return this.getBooksInList(listId).some((b) => b.id === bookId);
  }
}
