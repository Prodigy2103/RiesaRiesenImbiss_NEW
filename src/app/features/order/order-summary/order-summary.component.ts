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
  host: { 'id': 'orderflow-summary' }
})
export class OrderSummaryComponent implements OnInit {
  public order = inject(OrderService);
  private router = inject(Router);
  public dataService = inject(DataService);
  private ngZone = inject(NgZone);

  public isLoading = signal(false);
  public minTime = signal('');
  public customer = signal({ name: '', address: '', phone: '', scheduledTime: '' });

  public isOrderInvalid = computed(() => {
  const c = this.customer();
  const items = this.order.items();
  
  if (items.length === 0) return true;

  const hasValidName = c.name.trim().length >= 6;
  const hasValidPhone = c.phone.trim().length >= 11;
  const hasTime = !!c.scheduledTime;

  const basic = hasValidName && hasValidPhone && hasTime;

  if (this.order.deliveryType() === 'pickup') {
    return !basic;
  }

  const hasValidAddress = c.address.trim().length > 10;
  return !(basic && hasValidAddress && this.order.isMovReached());
});

  ngOnInit() {
  this.order.deliveryType.set('pickup'); // Zeile wenn lieferung läuft entfernen
  this.loadSavedData();
  this.calculateMinTime();
}

  private loadSavedData(): void {
    const saved = localStorage.getItem('imbiss_customer');
    if (saved) this.customer.set(JSON.parse(saved));
  }

  private calculateMinTime(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    const time = now.toTimeString().slice(0, 5);
    this.minTime.set(time);
    if (!this.customer().scheduledTime) {
      this.customer.update(prev => ({ ...prev, scheduledTime: time }));
    }
  }

  public setMode(mode: 'pickup' | 'delivery'): void {
    if (mode !== 'pickup') return; // Zeile wenn lieferung läuft entfernen
    this.order.deliveryType.set(mode);
  }

  async submitOrder(): Promise<void> {
  // 1. GUARD: Verhindert Klicks bei Invalidität, laufendem Prozess oder leerem Warenkorb
  if (this.isOrderInvalid() || this.isLoading() || this.order.items().length === 0) {
    return;
  }

  this.isLoading.set(true);
  const orderSnapshot = this.createOrderSnapshot();

  try {
    const orderId = await this.dataService.sendOrder(orderSnapshot);

    this.processSuccess(orderId, orderSnapshot.customer);
    localStorage.removeItem('imbiss_customer');
  } catch (error) {

    this.ngZone.run(() => this.isLoading.set(false));
    console.error('Bestellfehler:', error);
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