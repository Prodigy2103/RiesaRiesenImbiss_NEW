import { TestBed } from '@angular/core/testing';
import { OrderService, CartItem } from './order.service';
import { OrderArchiveService } from './order-archive.service';
import { OrderItem, CustomerData } from '../modals/order.model';

describe('OrderService', () => {
    let service: OrderService;
    let archiveServiceSpy: jasmine.SpyObj<OrderArchiveService>;

    const testItem: OrderItem = {
        id: 'item-1',
        name: 'Döner Kebab',
        category: 'doener',
        price: 7.5,
        amount: 1
    };

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        archiveServiceSpy = jasmine.createSpyObj<OrderArchiveService>('OrderArchiveService', [
            'archiveOrder',
            'getArchivedOrders',
            'getArchiveRange'
        ]);

        TestBed.configureTestingModule({
            providers: [
                OrderService,
                { provide: OrderArchiveService, useValue: archiveServiceSpy }
            ]
        });
        service = TestBed.inject(OrderService);
    });

    it('should initialize with empty cart and step 1', () => {
        expect(service.step()).toBe(1);
        expect(service.items().length).toBe(0);
        expect(service.total()).toBe(0);
    });

    it('should add item and update cart items quantity and total', () => {
        service.addItem(testItem);
        expect(service.items().length).toBe(1);
        expect(service.items()[0].quantity).toBe(1);
        expect(service.total()).toBe(7.5);
    });

    it('should increment quantity correctly', () => {
        service.addItem(testItem);
        service.incrementQuantity(0);
        expect(service.items()[0].quantity).toBe(2);
        expect(service.total()).toBe(15);
    });

    it('should decrement quantity and remove item when quantity reaches zero', () => {
        service.addItem(testItem);
        service.decrementQuantity(0);
        expect(service.items().length).toBe(0);
        expect(service.total()).toBe(0);
    });

    it('should calculate minimum order value and reach status', () => {
        service.zipCode.set('01589');
        expect(service.minOrderValue()).toBe(25);
        expect(service.isMovReached()).toBeFalse();
        service.addItem({ ...testItem, price: 30 });
        expect(service.isMovReached()).toBeTrue();
    });

    it('should complete order and persist to storage', () => {
        const customerPayload: CustomerData = {
            name: 'Max Mustermann',
            address: 'Hauptstraße 1',
            phone: '0123456789'
        };
        service.addItem(testItem);
        service.complete(customerPayload);
        expect(service.summary()?.customer.name).toBe('Max Mustermann');
        expect(service.customer().name).toBe('Max Mustermann');
    });

    it('should reset order and clear storage', () => {
        service.addItem(testItem);
        service.reset();
        expect(service.items().length).toBe(0);
        expect(service.step()).toBe(1);
    });

    it('should advance step only if valid', () => {
        service.next();
        expect(service.step()).toBe(2);
        service.next();
        expect(service.step()).toBe(2);
    });
});
