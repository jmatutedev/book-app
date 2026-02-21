import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private online = true;
  readonly onlineStatus$ = new Subject<boolean>();

  // Promesa que resuelve cuando el estado inicial ya fue consultado
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    const status = await Network.getStatus();
    this.online = status.connected;

    // Actualiza el estado ante cambios de conectividad
    Network.addListener('networkStatusChange', (status) => {
      this.updateStatus(status.connected);
    });

    setInterval(async () => {
      const current = await Network.getStatus();
      if (current.connected !== this.online) {
        this.updateStatus(current.connected);
      }
    }, 3000);
  }

  private updateStatus(connected: boolean): void {
    if (connected === this.online) return;
    this.online = connected;
    this.onlineStatus$.next(connected);
  }

  isOnline(): boolean {
    return this.online;
  }
}
