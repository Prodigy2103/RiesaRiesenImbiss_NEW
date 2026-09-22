import { Component, inject, signal, OnInit, computed, NgZone } from '@angular/core';
import { OrderService } from '../../../shared/services/order.service';
import { Router } from '@angular/router';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../../shared/services/data.services';
import { CustomerData } from '../../../shared/modals/order.model';
import { safeJsonParse } from '../../../shared/utils/storage.util';

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
  public customer = signal<CustomerData>({ name: '', address: '', phone: '', scheduledTime: '' });

  public isOrderInvalid = computed(() => {
    const currentCustomer = this.customer();
    const currentItems = this.order.items();
    if (currentItems.length === 0) return true;

    const hasValidName = currentCustomer.name.trim().length >= 6;
    const hasValidPhone = currentCustomer.phone.trim().length >= 11;
    const hasScheduledTime = !!currentCustomer.scheduledTime;
    const hasBasicInfo = hasValidName && hasValidPhone && hasScheduledTime;

    if (this.order.deliveryType() === 'pickup') {
      return !hasBasicInfo;
    }

    const hasValidAddress = currentCustomer.address.trim().length > 10;
    return !(hasBasicInfo && hasValidAddress && this.order.isMovReached());
  });

  ngOnInit(): void {
    this.order.deliveryType.set('pickup');
    this.loadPersistedCustomer();
    this.calculateMinTime();
  }

  private loadPersistedCustomer(): void {
    const rawCustomerJson = localStorage.getItem('imbiss_customer');
    const fallbackCustomer: CustomerData = { name: '', address: '', phone: '', scheduledTime: '' };
    this.customer.set(safeJsonParse<CustomerData>(rawCustomerJson, fallbackCustomer));
  }

  private calculateMinTime(): void {
    const calculatedDate = new Date();
    calculatedDate.setMinutes(calculatedDate.getMinutes() + 60);
    const formattedTimeString = calculatedDate.toTimeString().slice(0, 5);
    this.minTime.set(formattedTimeString);
    if (!this.customer().scheduledTime) {
      this.customer.update(existingCustomer => ({ ...existingCustomer, scheduledTime: formattedTimeString }));
    }
  }

  public setMode(deliveryMode: 'pickup' | 'delivery'): void {
    if (deliveryMode !== 'pickup') return;
    this.order.deliveryType.set(deliveryMode);
  }

  async submitOrder(): Promise<void> {
    if (this.isOrderInvalid() || this.isLoading() || this.order.items().length === 0) {
      return;
    }
    this.isLoading.set(true);
    await this.executeOrderSubmission();
  }

  private async executeOrderSubmission(): Promise<void> {
    const orderSnapshot = this.createOrderSnapshot();
    try {
      const orderId = await this.dataService.sendOrder(orderSnapshot);
      this.processSuccess(orderId, orderSnapshot.customer);
      localStorage.removeItem('imbiss_customer');
    } catch (orderError) {
      this.ngZone.run(() => this.isLoading.set(false));
      console.error('Bestellfehler:', orderError);
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

  private processSuccess(orderId: string, customerPayload: CustomerData): void {
    this.order.complete(customerPayload);
    this.order.updateId(orderId);
    this.isLoading.set(false);
    this.ngZone.run(() => this.router.navigate(['/checkout']));
  }

  public onZipInput(inputEvent: Event): void {
    const inputElement = inputEvent.target as HTMLInputElement;
    const sanitizedZipCode = inputElement.value.replace(/\D/g, '').slice(0, 5);
    this.order.zipCode.set(sanitizedZipCode);
    inputElement.value = sanitizedZipCode;
  }

  public persistCustomerData(): void {
    localStorage.setItem('imbiss_customer', JSON.stringify(this.customer()));
  }

  public updateCustomerField(fieldName: keyof CustomerData, fieldValue: string): void {
    this.customer.update(existingCustomer => ({ ...existingCustomer, [fieldName]: fieldValue }));
    this.persistCustomerData();
  }
}