import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KitchenInternalMonitorComponent } from './kitchen-internal-monitor.component';
import { AdminService } from '../../shared/services/admin.service';
import { signal } from '@angular/core';

describe('KitchenInternalMonitorComponent', () => {
  let component: KitchenInternalMonitorComponent;
  let fixture: ComponentFixture<KitchenInternalMonitorComponent>;
  let adminServiceSpy: any;

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['startListening', 'stopListening', 'orders']);
    adminServiceSpy.orders.and.returnValue(signal([]));

    await TestBed.configureTestingModule({
      imports: [KitchenInternalMonitorComponent],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(KitchenInternalMonitorComponent);
    component = fixture.componentInstance;
  });

  it('sollte window.print aufrufen und selectedOrder danach löschen', fakeAsync(() => {
    const mockOrder = { id: 'order123' } as any;
    spyOn(window, 'print');
    
    component.printOrder(mockOrder);
    expect(component.selectedOrder()).toEqual(mockOrder);
    
    tick(301); // Wartet das setTimeout ab
    expect(window.print).toHaveBeenCalled();
    expect(component.selectedOrder()).toBeNull();
  }));
});