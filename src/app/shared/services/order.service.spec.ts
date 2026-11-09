import { TestBed } from '@angular/core/testing';
import { OrderService, CartItem, areExtrasEqual } from './order.service';
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
        expect(service.minOrderValue()).toBe(20);
        expect(service.isMovReached()).toBeFalse();
        service.addItem({ ...testItem, price: 20 });
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

    it('should merge same item when added twice and increment quantity', () => {
        service.addItem(testItem);
        service.addItem(testItem);
        expect(service.items().length).toBe(1);
        expect(service.items()[0].quantity).toBe(2);
        expect(service.total()).toBe(15);
    });

    it('should merge same item with same extras regardless of selection order', () => {
        const extraOne: OrderItem = { id: '100', name: 'Sauce A', category: 'extras', price: 0, amount: 1 };
        const extraTwo: OrderItem = { id: '101', name: 'Sauce B', category: 'extras', price: 1, amount: 1 };
        service.addExtra(extraOne);
        service.addExtra(extraTwo);
        service.addItem(testItem);
        service.addExtra(extraTwo);
        service.addExtra(extraOne);
        service.addItem(testItem);
        expect(service.items().length).toBe(1);
        expect(service.items()[0].quantity).toBe(2);
    });

    it('should keep items separate when extras differ', () => {
        const extraSauce: OrderItem = { id: '100', name: 'Sauce A', category: 'extras', price: 0, amount: 1 };
        service.addExtra(extraSauce);
        service.addItem(testItem);
        service.addItem(testItem);
        expect(service.items().length).toBe(2);
        expect(service.items()[0].selectedExtras?.length).toBe(1);
        expect(service.items()[1].selectedExtras?.length).toBe(0);
    });

    it('should evaluate areExtrasEqual correctly for edge cases', () => {
        const extraOne: OrderItem = { id: '100', name: 'A', category: 'extras', price: 0, amount: 1 };
        const extraTwo: OrderItem = { id: '101', name: 'B', category: 'extras', price: 0, amount: 1 };
        expect(areExtrasEqual(undefined, [])).toBeTrue();
        expect(areExtrasEqual([], undefined)).toBeTrue();
        expect(areExtrasEqual([extraOne, extraTwo], [extraTwo, extraOne])).toBeTrue();
        expect(areExtrasEqual([extraOne], [extraTwo])).toBeFalse();
    });
});
