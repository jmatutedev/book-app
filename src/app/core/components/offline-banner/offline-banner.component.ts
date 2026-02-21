import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NetworkService } from '../../services/network/network.service';

@Component({
  selector: 'app-offline-banner',
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss'],
  standalone: true,
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  isOnline = true;
  private networkSub!: Subscription;

  constructor(private network: NetworkService) {}

  async ngOnInit(): Promise<void> {
    await this.network.ready;
    this.isOnline = this.network.isOnline();

    this.networkSub = this.network.onlineStatus$.subscribe((isOnline) => {
      this.isOnline = isOnline;
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }
}
