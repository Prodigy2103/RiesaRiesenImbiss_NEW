import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { OrderService } from '../../shared/services/order.service';
import { AdminService } from '../../shared/services/admin.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    const mockOrderService = {
      summary: signal({
        id: 'test-123',
        customer: { scheduledTime: '18:30', name: 'Max Mustermann', address: 'Musterstraße 1', phone: '0123456789' },
        items: [],
        total: 20,
        finalTotal: 20
      }),
      customer: signal({
        name: 'Max Mustermann',
        address: 'Musterstraße 1',
        phone: '0123456789',
        scheduledTime: '18:30'
      }),
      deliveryType: signal('pickup'),
      items: signal([]),
      total: signal(20),
      finalTotal: signal(20)
    };

    const mockAdminService = {
      getLiveOrder: jasmine.createSpy('getLiveOrder').and.returnValue(of({ status: 'new' }))
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: mockOrderService },
        { provide: AdminService, useValue: mockAdminService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
