import { Component, inject, signal, OnInit, computed, NgZone, DestroyRef } from '@angular/core';
import { OrderService } from '../../../shared/services/order.service';
import { Router } from '@angular/router';
import { NeonButtonComponent } from '../../../shared/ui/neon-button/neon-button.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DataService, isValidDeliveryAddress } from '../../../shared/services/data.services';
import { CustomerData } from '../../../shared/modals/order.model';
import { safeJsonParse } from '../../../shared/utils/storage.util';

export function isWithinDeliveryHours(targetDate: Date): boolean {
  const isSunday = targetDate.getDay() === 0;
  const currentMinutes = targetDate.getHours() * 60 + targetDate.getMinutes();
  const startMinutes = isSunday ? 13 * 60 : 11 * 60;
  const endMinutes = isSunday ? 19 * 60 + 30 : 21 * 60;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

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
  private destroyRef = inject(DestroyRef);

  public isLoading = signal(false);
  public minTime = signal('');
  public isCustomTimeSelected = signal(false);
  public isDeliveryAvailable = signal(isWithinDeliveryHours(new Date()));
  public customer = signal<CustomerData>({ name: '', address: '', phone: '', scheduledTime: '' });

  public isAddressInvalid = computed(() => {
    const rawAddress = this.customer().address.trim();
    return this.order.deliveryType() === 'delivery' && rawAddress.length > 0 && !isValidDeliveryAddress(rawAddress);
  });

  public isOrderInvalid = computed(() => {
    const currentCustomer = this.customer();
    if (this.order.items().length === 0 || !this.hasValidBasicInfo(currentCustomer)) {
      return true;
    }
    if (this.order.deliveryType() === 'pickup') {
      return false;
    }
    return !(isValidDeliveryAddress(currentCustomer.address) && this.order.isMovReached());
  });

  private hasValidBasicInfo(customerData: CustomerData): boolean {
    const hasValidName = customerData.name.trim().length >= 6;
    const hasValidPhone = customerData.phone.trim().length >= 11;
    const hasScheduledTime = !!customerData.scheduledTime;
    return hasValidName && hasValidPhone && hasScheduledTime;
  }

  ngOnInit(): void {
    this.order.deliveryType.set('pickup');
    this.loadPersistedCustomer();
    this.calculateMinTime();
    this.startLiveTimeSync();
  }

  private loadPersistedCustomer(): void {
    const rawCustomerJson = localStorage.getItem('imbiss_customer');
    const fallbackCustomer: CustomerData = { name: '', address: '', phone: '', scheduledTime: '' };
    const persistedCustomer = safeJsonParse<CustomerData>(rawCustomerJson, fallbackCustomer);
    this.customer.set({ ...persistedCustomer, scheduledTime: '' });
  }

  private startLiveTimeSync(): void {
    const intervalHandle = setInterval(() => this.calculateMinTime(), 15_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalHandle));
  }

  public calculateMinTime(referenceDate: Date = new Date()): void {
    this.syncDeliveryWindow(referenceDate);
    const calculatedDate = new Date(referenceDate.getTime() + 45 * 60_000);
    const formattedTimeString = calculatedDate.toTimeString().slice(0, 5);
    this.minTime.set(formattedTimeString);
    const currentScheduled = this.customer().scheduledTime || '';
    if (!this.isCustomTimeSelected() || currentScheduled < formattedTimeString) {
      this.customer.update(existingCustomer => ({ ...existingCustomer, scheduledTime: formattedTimeString }));
    }
  }

  private syncDeliveryWindow(referenceDate: Date): void {
    const canDeliverNow = isWithinDeliveryHours(referenceDate);
    this.isDeliveryAvailable.set(canDeliverNow);
    if (!canDeliverNow && this.order.deliveryType() === 'delivery') {
      this.order.deliveryType.set('pickup');
    }
  }

  public setMode(deliveryMode: 'pickup' | 'delivery'): void {
    if (deliveryMode === 'delivery' && !this.isDeliveryAvailable()) return;
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
    if (fieldName === 'scheduledTime') {
      this.isCustomTimeSelected.set(true);
    }
    const resolvedValue = fieldName === 'scheduledTime' && fieldValue < this.minTime() ? this.minTime() : fieldValue;
    this.customer.update(existingCustomer => ({ ...existingCustomer, [fieldName]: resolvedValue }));
    this.persistCustomerData();
  }
}