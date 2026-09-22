import { Injectable, signal, computed, inject, effect, Signal, WritableSignal } from '@angular/core';
import { OrderItem, CustomerData, Order } from '../modals/order.model';
import { OrderArchiveService } from './order-archive.service';

export type OrderStep = 1 | 2 | 3;
export type DeliveryType = 'delivery' | 'pickup';

export interface OrderSummary {
    id?: string;
    customer: CustomerData;
    items: CartItem[];
    total: number;
    finalTotal: number;
    deliveryType: DeliveryType;
}

export interface CartItem extends OrderItem {
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly orderArchiveService: OrderArchiveService = inject(OrderArchiveService);

    private readonly CUSTOMER_STORAGE_KEY: string = 'imbiss_customer';
    private readonly SUMMARY_STORAGE_KEY: string = 'last_order_summary';
    private readonly CART_STORAGE_KEY: string = 'imbiss_active_cart';
    private readonly MINIMUM_ORDER_VALUE_MAP: Readonly<Record<string, number>> = { '01589': 25, '01587': 30 };

    readonly step: WritableSignal<OrderStep> = signal<OrderStep>(1);
    readonly category: WritableSignal<string | null> = signal<string | null>(null);
    readonly deliveryType: WritableSignal<DeliveryType> = signal<DeliveryType>('delivery');
    readonly zipCode: WritableSignal<string> = signal<string>('');

    readonly items: WritableSignal<CartItem[]> = signal<CartItem[]>(this.loadCartFromStorage());
    readonly extras: WritableSignal<OrderItem[]> = signal<OrderItem[]>([]);
    readonly customer: WritableSignal<CustomerData> = signal<CustomerData>(this.getInitialCustomer());
    readonly summary: WritableSignal<OrderSummary | null> = signal<OrderSummary | null>(this.getSavedSummary());

    constructor() {
        effect(() => {
            localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.items()));
        });
    }

    readonly totalItemsCount: Signal<number> = computed(() => 
        this.items().reduce((runningTotal, cartItem) => runningTotal + cartItem.quantity, 0)
    );
    readonly total: Signal<number> = computed(() => this.calculateFullTotal());
    readonly finalTotal: Signal<number> = computed(() => this.total());
    readonly minOrderValue: Signal<number> = computed(() => this.MINIMUM_ORDER_VALUE_MAP[this.zipCode()] ?? 0);
    readonly isAreaSupported: Signal<boolean> = computed(() => !!this.MINIMUM_ORDER_VALUE_MAP[this.zipCode()]);
    readonly isMovReached: Signal<boolean> = computed(() => this.isAreaSupported() && this.total() >= this.minOrderValue());
    readonly missingAmount: Signal<number> = computed(() => Math.max(0, this.minOrderValue() - this.total()));

    addItem(itemToAdd: OrderItem): void {
        const currentExtras = [...this.extras()];
        this.items.update(currentItems => this.mergeItemIntoCart(currentItems, itemToAdd, currentExtras));
        this.resetExtras();
    }

    private mergeItemIntoCart(cartItems: CartItem[], itemToAdd: OrderItem, currentExtras: OrderItem[]): CartItem[] {
        const existingItem = cartItems.find(cartItem => 
            cartItem.id === itemToAdd.id && JSON.stringify(cartItem.selectedExtras) === JSON.stringify(currentExtras)
        );
        if (!existingItem) {
            return [...cartItems, { ...itemToAdd, quantity: 1, selectedExtras: currentExtras }];
        }
        return cartItems.map(cartItem => 
            cartItem === existingItem ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
    }

    incrementQuantity(targetIndex: number): void {
        this.items.update(cartItems => 
            cartItems.map((cartItem, itemIndex) => 
                itemIndex === targetIndex ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            )
        );
    }

    decrementQuantity(targetIndex: number): void {
        this.items.update(cartItems => 
            cartItems.map((cartItem, itemIndex) => 
                itemIndex === targetIndex ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
            ).filter(cartItem => cartItem.quantity > 0)
        );
    }

    addExtra(extraItem: OrderItem): void {
        this.extras.update(extrasList => 
            extrasList.some(existingExtra => existingExtra.id === extraItem.id) 
                ? extrasList 
                : [...extrasList, extraItem]
        );
    }

    removeExtraById(extraIdentifier: string | number): void {
        this.extras.update(extrasList => 
            extrasList.filter(existingExtra => existingExtra.id !== extraIdentifier)
        );
    }

    resetExtras(): void {
        this.extras.set([]);
    }

    complete(customerPayload: CustomerData): void {
        const orderSnapshot: OrderSummary = this.buildSummarySnapshot(customerPayload);
        this.customer.set({ ...customerPayload });
        this.summary.set(orderSnapshot);
        this.persistOrderSummary(orderSnapshot, customerPayload);
    }

    private buildSummarySnapshot(customerPayload: CustomerData): OrderSummary {
        return {
            customer: { ...customerPayload },
            items: [...this.items()],
            total: this.total(),
            finalTotal: this.finalTotal(),
            deliveryType: this.deliveryType()
        };
    }

    private persistOrderSummary(orderSnapshot: OrderSummary, customerPayload: CustomerData): void {
        sessionStorage.setItem(this.SUMMARY_STORAGE_KEY, JSON.stringify(orderSnapshot));
        localStorage.setItem(this.CUSTOMER_STORAGE_KEY, JSON.stringify(customerPayload));
    }

    updateId(orderIdentifier: string): void {
        const currentSummary = this.summary();
        if (!currentSummary) return;
        const updatedSummary: OrderSummary = { ...currentSummary, id: orderIdentifier };
        this.summary.set(updatedSummary);
        sessionStorage.setItem(this.SUMMARY_STORAGE_KEY, JSON.stringify(updatedSummary));
    }

    reset(): void {
        this.step.set(1);
        this.items.set([]);
        this.zipCode.set('');
        this.resetExtras();
        localStorage.removeItem(this.CART_STORAGE_KEY);
    }

    next(): void {
        if (this.step() === 2 && this.totalItemsCount() === 0) return;
        this.step.update(currentStep => (currentStep < 3 ? (currentStep + 1) as OrderStep : currentStep));
    }

    back(): void {
        this.step.update(currentStep => (currentStep > 1 ? (currentStep - 1) as OrderStep : currentStep));
    }

    private loadCartFromStorage(): CartItem[] {
        const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
        try {
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    }

    private getInitialCustomer(): CustomerData {
        const savedCustomer = localStorage.getItem(this.CUSTOMER_STORAGE_KEY);
        return savedCustomer ? JSON.parse(savedCustomer) : { name: '', address: '', phone: '' };
    }

    private getSavedSummary(): OrderSummary | null {
        const savedSummary = sessionStorage.getItem(this.SUMMARY_STORAGE_KEY);
        return savedSummary ? JSON.parse(savedSummary) as OrderSummary : null;
    }

    private calculateFullTotal(): number {
        return this.items().reduce((runningTotal, cartItem) => {
            const extrasPriceSum = (cartItem.selectedExtras || []).reduce(
                (sumOfExtras, singleExtra) => sumOfExtras + singleExtra.price, 0
            );
            return runningTotal + (cartItem.price + extrasPriceSum) * cartItem.quantity;
        }, 0);
    }

    archiveOrder(orderToArchive: Order): Promise<void> {
        return this.orderArchiveService.archiveOrder(orderToArchive);
    }

    getArchivedOrders(dateString: string): Promise<Order[]> {
        return this.orderArchiveService.getArchivedOrders(dateString);
    }

    getArchiveRange(endDateString: string): Promise<Order[]> {
        return this.orderArchiveService.getArchiveRange(endDateString);
    }
}