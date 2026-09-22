import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KitchenInternalMonitorComponent } from './kitchen-internal-monitor.component';
import { AdminService } from '../../shared/services/admin.service';
import { OrderService } from '../../shared/services/order.service';
import { signal, WritableSignal } from '@angular/core';
import { Order } from '../../shared/modals/order.model';
import { Timestamp } from '@angular/fire/firestore';

describe('KitchenInternalMonitorComponent', () => {
  let component: KitchenInternalMonitorComponent;
  let fixture: ComponentFixture<KitchenInternalMonitorComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj<AdminService>('AdminService', ['startListening', 'stopListening']);
    (adminServiceSpy as { orders: WritableSignal<Order[]> }).orders = signal<Order[]>([]);

    const mockOrderService = {
      archiveOrder: jasmine.createSpy('archiveOrder').and.resolveTo()
    };

    await TestBed.configureTestingModule({
      imports: [KitchenInternalMonitorComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KitchenInternalMonitorComponent);
    component = fixture.componentInstance;
  });

  it('sollte window.print aufrufen und selectedOrder danach löschen', fakeAsync(() => {
    const mockOrder: Order = {
      id: 'order123',
      status: 'new',
      customer: { name: 'Max', address: 'Street', phone: '123' },
      items: [],
      total: 0,
      finalTotal: 0,
      deliveryType: 'pickup',
      createdAt: Timestamp.now()
    };
    spyOn(window, 'print');

    component.printOrder(mockOrder);
    expect(component.selectedOrder()).toEqual(mockOrder);

    tick(400);
    expect(window.print).toHaveBeenCalled();
    expect(component.selectedOrder()).toBeNull();
  }));
});