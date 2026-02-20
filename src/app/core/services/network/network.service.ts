import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private online = true;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const status = await Network.getStatus();
    this.online = status.connected;

    // Actualiza el estado ante cambios de conectividad
    Network.addListener('networkStatusChange', (status) => {
      this.online = status.connected;
    });
  }

  isOnline(): boolean {
    return this.online;
  }
}
