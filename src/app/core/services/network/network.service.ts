import { Injectable, OnDestroy } from '@angular/core';
import { Network } from '@capacitor/network';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService implements OnDestroy {
  private online = true;
  private pollInterval!: ReturnType<typeof setInterval>;

  readonly onlineStatus$ = new Subject<boolean>();
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    const status = await Network.getStatus();
    this.online = status.connected;

    Network.addListener('networkStatusChange', (status) => {
      this.updateStatus(status.connected);
    });

    this.pollInterval = setInterval(async () => {
      const current = await Network.getStatus();
      if (current.connected !== this.online) {
        this.updateStatus(current.connected);
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
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
