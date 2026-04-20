import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderSummaryComponent } from './order-summary.component';
import { OrderService } from '../../../shared/services/order.service';
import { DataService } from '../../../shared/services/data.services';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('OrderSummaryComponent', () => {
  let fixture: ComponentFixture<OrderSummaryComponent>;
  let component: OrderSummaryComponent;
  let orderServiceMock: any;
  let dataServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // 1. Mocks definieren (Wichtig: Signale für Angular 19)
    orderServiceMock = {
      deliveryType: signal('pickup'),
      isMovReached: () => true,
      summary: () => ({ total: 25.50 }), // Mock-Daten für sendOrder
      updateId: jasmine.createSpy('updateId'),
      zipCode: signal('12345')
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
    // Signal-Update via Hilfsmethode
    component.updateCustomerField('name', 'Max Mustermann');
    component.updateCustomerField('phone', '0123456789');
    // scheduledTime wird meist im ngOnInit gesetzt, hier zur Sicherheit:
    component.updateCustomerField('scheduledTime', '18:00');
    
    fixture.detectChanges();
    expect(component.isOrderInvalid()).toBeFalse();
  });

  it('sollte nach 800ms Animation zum Checkout navigieren', fakeAsync(() => {
    // Setup valid state
    component.updateCustomerField('name', 'Max');
    component.updateCustomerField('phone', '0123456789');
    
    component.submitOrder(); // Startet Async Prozess
    
    tick(850); // Spult die Zeit vor (800ms Animation + Puffer)
    
    expect(dataServiceMock.sendOrder).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/checkout']);
    expect(component.isLoading()).toBeFalse();
  }));
});