import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { GENRES, Genre } from '../../core/models/genre/genre.model';
import { AppHeaderComponent } from '../../core/components/header/header.component';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.page.html',
  styleUrls: ['./genres.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    AppHeaderComponent,
  ],
})
export class GenresPage {
  readonly genres: Genre[] = GENRES;

  constructor(private router: Router) {
    addIcons({ chevronForwardOutline });
  }

  goToBooks(genre: Genre): void {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/book-list', genre.id], {
      state: { label: genre.label },
    });
  }
}
