import { Component, Input, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  searchOutline,
  alertCircleOutline,
  bookOutline,
} from 'ionicons/icons';

export type EmptyStateType = 'offline' | 'no-results' | 'error' | 'no-data';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class EmptyStateComponent implements OnInit {
  @Input({ required: true }) type!: EmptyStateType;
  @Input() message?: string;

  ngOnInit(): void {
    addIcons({
      cloudOfflineOutline,
      searchOutline,
      alertCircleOutline,
      bookOutline,
    });
  }

  get icon(): string {
    switch (this.type) {
      case 'offline':
        return 'cloud-offline-outline';
      case 'no-results':
        return 'search-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'no-data':
        return 'book-outline';
    }
  }

  get title(): string {
    switch (this.type) {
      case 'offline':
        return 'Sin conexión';
      case 'no-results':
        return 'Sin resultados';
      case 'error':
        return 'Algo salió mal';
      case 'no-data':
        return 'Sin datos guardados';
    }
  }

  get defaultMessage(): string {
    switch (this.type) {
      case 'offline':
        return 'Conectate a internet para ver el contenido.';
      case 'no-results':
        return 'No encontramos resultados para tu búsqueda.';
      case 'error':
        return 'Ocurrió un error al cargar los datos. Intentá de nuevo.';
      case 'no-data':
        return 'No hay datos guardados localmente.';
    }
  }
}
