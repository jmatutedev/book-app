import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'genres',
        loadComponent: () =>
          import('./pages/genres/genres.page').then((m) => m.GenresPage),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'custom-lists',
        loadComponent: () =>
          import('./pages/custom-lists/custom-lists.page').then(
            (m) => m.CustomListsPage,
          ),
      },
      {
        path: '',
        redirectTo: 'genres',
        pathMatch: 'full',
      },
    ],
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
  {
    path: 'custom-lists/:listId',
    loadComponent: () =>
      import('./pages/custom-lists/list-detail/list-detail.page').then(
        (m) => m.ListDetailPage,
      ),
  },
];
