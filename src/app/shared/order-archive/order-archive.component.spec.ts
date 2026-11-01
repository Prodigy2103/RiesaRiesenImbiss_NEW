import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Timestamp } from '@angular/fire/firestore';
import { OrderArchiveComponent } from './order-archive.component';
import { OrderService } from '../services/order.service';
import { Order } from '../modals/order.model';

describe('OrderArchiveComponent', () => {
  let component: OrderArchiveComponent;
  let fixture: ComponentFixture<OrderArchiveComponent>;
  let mockOrderService: jasmine.SpyObj<Pick<OrderService, 'getArchiveRange'>>;

  beforeEach(async () => {
    mockOrderService = {
      getArchiveRange: jasmine.createSpy('getArchiveRange').and.resolveTo([])
    };

    await TestBed.configureTestingModule({
      imports: [OrderArchiveComponent],
      providers: [{ provide: OrderService, useValue: mockOrderService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderArchiveComponent);
    component = fixture.componentInstance;
  });

  it('sollte beim Start orders laden', async () => {
    component.ngOnInit();
    expect(mockOrderService.getArchiveRange).toHaveBeenCalled();
  });

  it('sollte Umsatz nach Abholung/Lieferung sowie 7% (Speisen) und 19% (Getränke) MwSt trennen', () => {
    component.selectedDate.set('2026-11-01');
    const sampleDate = Timestamp.fromDate(new Date('2026-11-01T12:00:00'));

    const mockOrders: Order[] = [
      {
        id: 'order-pickup-1',
        status: 'done',
        customer: { name: 'Anna Beispiel', address: '', phone: '017612345678' },
        items: [
          { id: '1', name: 'Döner', category: 'doener', price: 10.7, amount: 1, quantity: 1 },
          { id: '2', name: 'Cola', category: 'alkfree', price: 2.38, amount: 1, quantity: 1 }
        ],
        total: 13.08,
        finalTotal: 13.08,
        deliveryType: 'pickup',
        createdAt: sampleDate
      },
      {
        id: 'order-delivery-1',
        status: 'done',
        customer: { name: 'Max Mustermann', address: 'Hauptstraße 12', phone: '017698765432' },
        items: [
          { id: '3', name: 'Pizza Margherita', category: 'pizza', price: 21.4, amount: 1, quantity: 1 }
        ],
        total: 21.4,
        finalTotal: 21.4,
        deliveryType: 'delivery',
        createdAt: sampleDate
      }
    ];

    component.orders.set(mockOrders);

    expect(component.pickupOrdersOfSelectedDay().length).toBe(1);
    expect(component.deliveryOrdersOfSelectedDay().length).toBe(1);
    expect(component.pickupRevenue()).toBeCloseTo(13.08, 2);
    expect(component.deliveryRevenue()).toBeCloseTo(21.4, 2);
    expect(component.totalRevenue()).toBeCloseTo(34.48, 2);

    expect(component.drinksGrossRevenue()).toBeCloseTo(2.38, 2);
    expect(component.foodGrossRevenue()).toBeCloseTo(32.1, 2);
    expect(component.drinksTaxAmount()).toBeCloseTo(0.38, 2);
    expect(component.foodTaxAmount()).toBeCloseTo(2.1, 2);
    expect(component.taxAmount()).toBeCloseTo(2.48, 2);
  });
});