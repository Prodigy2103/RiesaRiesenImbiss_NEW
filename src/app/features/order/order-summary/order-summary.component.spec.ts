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

  it('sollte den Wechsel auf Lieferung erlauben und Adresspflicht prüfen', () => {
    component.updateCustomerField('name', 'Max Mustermann');
    component.updateCustomerField('phone', '012345678901');
    component.updateCustomerField('scheduledTime', '18:00');
    component.setMode('delivery');
    fixture.detectChanges();

    expect(orderServiceMock.deliveryType()).toBe('delivery');
    expect(component.isOrderInvalid()).toBeTrue();

    component.updateCustomerField('address', 'Hauptstraße 12, 01587 Riesa');
    fixture.detectChanges();
    expect(component.isOrderInvalid()).toBeFalse();
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