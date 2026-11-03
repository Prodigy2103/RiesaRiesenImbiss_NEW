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

  it('sollte verkaufte Produkte getrennt nach Abholung und Lieferung berechnen (Option 2)', () => {
    component.selectedDate.set('2026-11-01');
    const sampleDate = Timestamp.fromDate(new Date('2026-11-01T12:00:00'));

    const mockOrders: Order[] = [
      {
        id: 'order-pickup-1',
        status: 'done',
        customer: { name: 'Anna', address: '', phone: '01761111' },
        items: [
          { id: '1', name: 'Döner Kebab', category: 'doener', price: 7.0, amount: 2, quantity: 2 },
          { id: '2', name: 'Cola 0.33l', category: 'alkfree', price: 2.5, amount: 1, quantity: 1 }
        ],
        total: 16.5,
        finalTotal: 16.5,
        deliveryType: 'pickup',
        createdAt: sampleDate
      },
      {
        id: 'order-pickup-2',
        status: 'done',
        customer: { name: 'Ben', address: '', phone: '01762222' },
        items: [
          {
            id: '1',
            name: 'Döner Kebab',
            category: 'doener',
            price: 7.0,
            amount: 1,
            quantity: 1,
            selectedExtras: [{ id: 'extra-1', name: 'Käse', category: 'extra', price: 1.0, amount: 1 }]
          }
        ],
        total: 8.0,
        finalTotal: 8.0,
        deliveryType: 'pickup',
        createdAt: sampleDate
      },
      {
        id: 'order-delivery-1',
        status: 'done',
        customer: { name: 'Clara', address: 'Weg 1', phone: '01763333' },
        items: [
          { id: '3', name: 'Pizza Margherita', category: 'pizza', price: 9.5, amount: 2, quantity: 2 },
          { id: '1', name: 'Döner Kebab', category: 'doener', price: 7.0, amount: 1, quantity: 1 }
        ],
        total: 26.0,
        finalTotal: 26.0,
        deliveryType: 'delivery',
        createdAt: sampleDate
      }
    ];

    component.orders.set(mockOrders);

    const pickupSales = component.pickupProductSales();
    expect(pickupSales.length).toBe(2);

    const doenerPickup = pickupSales.find(sale => sale.name === 'Döner Kebab');
    expect(doenerPickup).toBeDefined();
    expect(doenerPickup?.quantity).toBe(3);
    expect(doenerPickup?.revenue).toBeCloseTo(22.0, 2);

    const colaPickup = pickupSales.find(sale => sale.name === 'Cola 0.33l');
    expect(colaPickup).toBeDefined();
    expect(colaPickup?.quantity).toBe(1);
    expect(colaPickup?.revenue).toBeCloseTo(2.5, 2);

    const deliverySales = component.deliveryProductSales();
    expect(deliverySales.length).toBe(2);

    const pizzaDelivery = deliverySales.find(sale => sale.name === 'Pizza Margherita');
    expect(pizzaDelivery).toBeDefined();
    expect(pizzaDelivery?.quantity).toBe(2);
    expect(pizzaDelivery?.revenue).toBeCloseTo(19.0, 2);

    const doenerDelivery = deliverySales.find(sale => sale.name === 'Döner Kebab');
    expect(doenerDelivery).toBeDefined();
    expect(doenerDelivery?.quantity).toBe(1);
    expect(doenerDelivery?.revenue).toBeCloseTo(7.0, 2);
  });
});
