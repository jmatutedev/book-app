import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'genres',
    pathMatch: 'full',
  },
  {
    path: 'genres',
    loadComponent: () =>
      import('./pages/genres/genres.page').then((m) => m.GenresPage),
  },
  {
    path: 'book-list/:genreId',
    loadComponent: () =>
      import('./pages/book-list/book-list.page').then((m) => m.BookListPage),
  },
  {
    path: 'book-detail/:bookId',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.page').then(
        (m) => m.BookDetailPage,
      ),
  },
];
