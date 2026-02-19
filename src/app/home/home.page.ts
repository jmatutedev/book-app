import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import { SqliteService } from '../core/services/database/sqlite.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
  ],
})
export class HomePage implements OnInit {
  books: any[] = [];
  newTitle = '';

  constructor(
    private sqlite: SqliteService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.sqlite.ensureReady();

    await this.sqlite.saveBooks([
      { id: '1', title: 'Libro SQLite OK' },
      { id: '2', title: 'Otro libro de prueba' },
    ]);

    await this.loadBooks();
  }

  async loadBooks() {
    try {
      this.books = await this.sqlite.getAllBooks();
      console.log('Libros cargados en componente:', this.books);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error al cargar libros:', err);
    }
  }

  async addBook() {
    if (!this.newTitle.trim()) return;

    const book = {
      id: Date.now().toString(),
      title: this.newTitle,
    };

    await this.sqlite.saveBooks([book]);
    this.newTitle = '';
    await this.loadBooks();
  }

  async clear() {
    await this.sqlite.clearBooks();
    await this.loadBooks();
  }
}
