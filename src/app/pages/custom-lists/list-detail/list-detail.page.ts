import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Book } from '../../../core/models/books/book.model';
import { LocalListsService } from '../../../core/services/web-list/web-lists.service';
import { AppHeaderComponent } from '../../../core/components/header/header.component';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    AppHeaderComponent,
  ],
})
export class ListDetailPage implements OnInit {
  listId!: string;
  listName!: string;
  books: Book[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localListsService: LocalListsService,
    private alertCtrl: AlertController,
  ) {
    addIcons({ trashOutline });
  }

  ngOnInit(): void {
    this.listId = this.route.snapshot.paramMap.get('listId')!;
    this.listName = history.state?.name ?? 'Lista';
    this.loadBooks();
  }

  async loadBooks(): Promise<void> {
    this.books = await this.localListsService.getBooksInList(this.listId);
  }

  async removeBook(book: Book, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar libro',
      message: `¿Querés quitar "${book.title}" de esta lista?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.localListsService.removeBookFromList(
              this.listId,
              book.id,
            );
            await this.loadBooks();
          },
        },
      ],
    });
    await alert.present();
  }

  goToDetail(book: Book): void {
    this.router.navigate(['/book-detail', book.id.replace('/works/', '')], {
      state: { fromList: true },
    });
  }
}
