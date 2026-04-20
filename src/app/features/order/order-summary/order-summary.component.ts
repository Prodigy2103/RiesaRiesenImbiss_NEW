import { Component, inject, signal, OnInit, computed, NgZone } from '@angular/core';
import { OrderService } from '../../../shared/services/order.service';
import { Router } from '@angular/router';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../../shared/services/data.services';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [NeonButtonComponent, FormsModule, DecimalPipe],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
  host: { 'id': 'orderflow-summary' } // ID korrigiert für SCSS
})
export class OrderSummaryComponent implements OnInit {
  public order = inject(OrderService);
  private router = inject(Router);
  public dataService = inject(DataService);
  private ngZone = inject(NgZone);

  public isLoading = signal(false);
  public minTime = signal('');
  public customer = signal({ name: '', address: '', phone: '', scheduledTime: '' });

  // Angular 19 Computed Signal für Validierung (Sauber & Performant)
  public isOrderInvalid = computed(() => {
    const c = this.customer();
    const basic = c.name.trim().length > 0 && c.phone.trim().length > 5 && !!c.scheduledTime;
    if (this.order.deliveryType() === 'pickup') return !basic;
    return !(basic && c.address.trim().length > 5 && this.order.isMovReached());
  });

  ngOnInit() {
    this.loadSavedData();
    this.calculateMinTime();
  }

  private loadSavedData(): void {
    const saved = localStorage.getItem('imbiss_customer');
    if (saved) this.customer.set(JSON.parse(saved));
  }

  private calculateMinTime(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 20);
    const time = now.toTimeString().slice(0, 5);
    this.minTime.set(time);
    if (!this.customer().scheduledTime) {
      this.customer.update(prev => ({ ...prev, scheduledTime: time }));
    }
  }

  public setMode(mode: 'pickup' | 'delivery'): void {
    this.order.deliveryType.set(mode);
  }

  async submitOrder(): Promise<void> {
    const data = this.createOrderSnapshot();
    if (this.order.items().length === 0 || this.isLoading()) return;

    this.isLoading.set(true);
    try {
      const orderId = await this.dataService.sendOrder(data);
      this.processSuccess(orderId, data.customer);
    } catch (e) {
      this.ngZone.run(() => this.isLoading.set(false));
    }
  }

  private createOrderSnapshot() {
    return {
      customer: this.customer(),
      items: this.order.items(),
      total: this.order.total(),
      finalTotal: this.order.total(),
      deliveryType: this.order.deliveryType()
    };
  }

  private processSuccess(orderId: string, customer: any): void {
    this.order.complete(customer);
    this.order.updateId(orderId);
    this.ngZone.run(() => this.router.navigate(['/checkout']));
  }

  public onZipInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 5);
    this.order.zipCode.set(value);
    input.value = value;
  }

  public saveData(): void {
    localStorage.setItem('imbiss_customer', JSON.stringify(this.customer()));
  }

  public updateCustomerField(field: string, value: string): void {
    this.customer.update(prev => ({ ...prev, [field]: value }));
    this.saveData();
  }
}