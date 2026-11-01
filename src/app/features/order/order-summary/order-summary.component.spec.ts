import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderSummaryComponent } from './order-summary.component';
import { OrderService } from '../../../shared/services/order.service';
import { DataService } from '../../../shared/services/data.services';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { OrderItem } from '../../../shared/modals/order.model';

interface MockOrderService {
  deliveryType: WritableSignal<'pickup' | 'delivery'>;
  isAreaSupported: () => boolean;
  isMovReached: () => boolean;
  missingAmount: () => number;
  summary: () => { total: number };
  updateId: jasmine.Spy;
  complete: jasmine.Spy;
  zipCode: WritableSignal<string>;
  items: WritableSignal<OrderItem[]>;
  total: WritableSignal<number>;
  finalTotal: WritableSignal<number>;
}

describe('OrderSummaryComponent', () => {
  let fixture: ComponentFixture<OrderSummaryComponent>;
  let component: OrderSummaryComponent;
  let orderServiceMock: MockOrderService;
  let dataServiceMock: { sendOrder: jasmine.Spy };
  let routerMock: { navigate: jasmine.Spy };

  const defaultMockItem: OrderItem = {
    id: 'item-1',
    name: 'Döner Kebab',
    price: 7.5,
    amount: 1,
    category: 'doener'
  };

  beforeEach(async () => {
    orderServiceMock = {
      deliveryType: signal<'pickup' | 'delivery'>('pickup'),
      isAreaSupported: () => true,
      isMovReached: () => true,
      missingAmount: () => 0,
      summary: () => ({ total: 25.50 }),
      updateId: jasmine.createSpy('updateId'),
      complete: jasmine.createSpy('complete'),
      zipCode: signal('12345'),
      items: signal<OrderItem[]>([defaultMockItem]),
      total: signal(25.50),
      finalTotal: signal(25.50)
    };
    dataServiceMock = { sendOrder: jasmine.createSpy('sendOrder').and.resolveTo('order-123') };
    routerMock = { navigate: jasmine.createSpy('navigate').and.resolveTo(true) };

    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceMock },
        { provide: DataService, useValue: dataServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sollte den Button aktivieren, wenn alle Pflichtfelder ausgefüllt sind', () => {
    component.updateCustomerField('name', 'Max Mustermann');
    component.updateCustomerField('phone', '012345678901');
    component.updateCustomerField('scheduledTime', '18:00');
    fixture.detectChanges();
    expect(component.isOrderInvalid()).toBeFalse();
  });

  it('sollte den Wechsel auf Lieferung innerhalb der Lieferzeiten erlauben und Straße + Hausnummer erzwingen', () => {
    component.calculateMinTime(new Date('2026-11-02T14:00:00'));
    component.updateCustomerField('name', 'Max Mustermann');
    component.updateCustomerField('phone', '012345678901');
    component.updateCustomerField('scheduledTime', '18:00');
    component.setMode('delivery');
    fixture.detectChanges();

    expect(component.isDeliveryAvailable()).toBeTrue();
    expect(orderServiceMock.deliveryType()).toBe('delivery');
    expect(component.isOrderInvalid()).toBeTrue();

    component.updateCustomerField('address', 'Hauptstraße');
    expect(component.isOrderInvalid()).toBeTrue();
    expect(component.isAddressInvalid()).toBeTrue();

    component.updateCustomerField('address', '12345678901');
    expect(component.isOrderInvalid()).toBeTrue();
    expect(component.isAddressInvalid()).toBeTrue();

    component.updateCustomerField('address', '01587 Riesa');
    expect(component.isOrderInvalid()).toBeTrue();

    component.updateCustomerField('address', 'Hauptstraße 12a');
    fixture.detectChanges();
    expect(component.isAddressInvalid()).toBeFalse();
    expect(component.isOrderInvalid()).toBeFalse();
  });

  it('sollte den Liefer-Button außerhalb der Lieferzeiten (Mo-Sa 11-20, So 13-19) sperren', () => {
    component.calculateMinTime(new Date('2026-11-01T19:30:00'));
    expect(component.isDeliveryAvailable()).toBeFalse();

    component.setMode('delivery');
    expect(orderServiceMock.deliveryType()).toBe('pickup');

    component.calculateMinTime(new Date('2026-11-02T10:30:00'));
    expect(component.isDeliveryAvailable()).toBeFalse();
  });

  it('sollte beim Starten +45 Minuten als Standardzeit setzen und manuelle spätere Auswahl erlauben', () => {
    const expectedDate = new Date(Date.now() + 45 * 60_000);
    const expectedTime = expectedDate.toTimeString().slice(0, 5);

    expect(component.minTime()).toBe(expectedTime);
    expect(component.customer().scheduledTime).toBe(expectedTime);

    component.updateCustomerField('scheduledTime', '23:55');
    expect(component.isCustomTimeSelected()).toBeTrue();
    expect(component.customer().scheduledTime).toBe('23:55');
  });

  it('sollte nach 800ms Animation zum Checkout navigieren', fakeAsync(() => {
    component.updateCustomerField('name', 'Max Mustermann');
    component.updateCustomerField('phone', '012345678901');
    component.updateCustomerField('scheduledTime', '18:00');
    fixture.detectChanges();

    component.submitOrder();
    tick(850);
    expect(dataServiceMock.sendOrder).toHaveBeenCalled();
    expect(orderServiceMock.complete).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/checkout']);
    expect(component.isLoading()).toBeFalse();
  }));
});