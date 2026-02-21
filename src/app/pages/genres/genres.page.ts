import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { GENRES, Genre } from '../../core/models/genre/genre.model';
import { AppHeaderComponent } from 'src/app/core/components/header/header.component';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.page.html',
  standalone: true,
  imports: [IonContent, IonList, IonItem, IonLabel, AppHeaderComponent],
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
