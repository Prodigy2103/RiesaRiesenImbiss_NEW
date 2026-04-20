import { Injectable, signal, computed } from '@angular/core';
import { OrderItem, CustomerData } from '../modals/order.model';

export type OrderStep = 1 | 2 | 3;
export type DeliveryType = 'delivery' | 'pickup';

/**
 * Interface für den Abschluss der Bestellung.
 * Entspricht exakt dem, was DataService.sendOrder erwartet.
 */
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
    private readonly CUSTOMER_KEY = 'imbiss_customer';
    private readonly SUMMARY_KEY = 'last_order_summary';

    // --- 1. STATES ---
    step = signal<OrderStep>(1);
    category = signal<string | null>(null);
    deliveryType = signal<DeliveryType>('delivery');
    zipCode = signal<string>('');

    items = signal<CartItem[]>([]);
    extras = signal<OrderItem[]>([]);
    customer = signal<CustomerData>(this.getInitialCustomer());
    summary = signal<OrderSummary | null>(this.getSavedSummary());

    // --- 2. COMPUTED ---
    totalItemsCount = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
    total = computed(() => this.calculateFullTotal());
    finalTotal = computed(() => this.total());

    private readonly movMap: Record<string, number> = { '01589': 25, '01587': 30 };
    minOrderValue = computed(() => this.movMap[this.zipCode()] ?? 0);
    isAreaSupported = computed(() => !!this.movMap[this.zipCode()]);
    isMovReached = computed(() => this.isAreaSupported() && this.total() >= this.minOrderValue());
    missingAmount = computed(() => Math.max(0, this.minOrderValue() - this.total()));

    // --- 3. WARENKORB LOGIK ---
    addItem(item: OrderItem): void {
        const currentExtras = [...this.extras()];
        this.items.update(list => {
            const match = list.find(i => i.id === item.id && 
                JSON.stringify(i.selectedExtras) === JSON.stringify(currentExtras));
            
            return match 
                ? list.map(it => it === match ? { ...it, quantity: it.quantity + 1 } : it)
                : [...list, { ...item, quantity: 1, selectedExtras: currentExtras }];
        });
        this.resetExtras();
    }

    incrementQuantity(index: number): void {
        this.items.update(l => l.map((it, i) => i === index ? { ...it, quantity: it.quantity + 1 } : it));
    }

    decrementQuantity(index: number): void {
        this.items.update(l => l.map((it, i) => i === index ? { ...it, quantity: it.quantity - 1 } : it)
            .filter(it => it.quantity > 0));
    }

    addExtra(extra: OrderItem): void {
        this.extras.update(l => l.some(e => e.id === extra.id) ? l : [...l, extra]);
    }

    removeExtraById(id: string | number): void {
        this.extras.update(l => l.filter(e => e.id !== id));
    }

    resetExtras(): void { this.extras.set([]); }

    // --- 4. NAVIGATION & PERSISTENCE ---
    complete(data: CustomerData): void {
        const snapshot: OrderSummary = {
            customer: { ...data },
            items: [...this.items()],
            total: this.total(),
            finalTotal: this.finalTotal(),
            deliveryType: this.deliveryType()
        };
        this.summary.set(snapshot);
        sessionStorage.setItem(this.SUMMARY_KEY, JSON.stringify(snapshot));
    }

    updateId(orderId: string): void {
        const current = this.summary();
        if (!current) return;
        const updated = { ...current, id: orderId };
        this.summary.set(updated);
        sessionStorage.setItem(this.SUMMARY_KEY, JSON.stringify(updated));
    }

    reset(): void {
        this.step.set(1);
        this.items.set([]);
        this.zipCode.set('');
        this.resetExtras();
    }

    next(): void { this.step.update(s => (s < 3 ? (s + 1) as OrderStep : s)); }
    back(): void { this.step.update(s => (s > 1 ? (s - 1) as OrderStep : s)); }

    private getInitialCustomer(): CustomerData {
        const saved = localStorage.getItem(this.CUSTOMER_KEY);
        return saved ? JSON.parse(saved) : { name: '', address: '', phone: '' };
    }

    private getSavedSummary(): OrderSummary | null {
        const saved = sessionStorage.getItem(this.SUMMARY_KEY);
        return saved ? JSON.parse(saved) as OrderSummary : null;
    }

    private calculateFullTotal(): number {
        return this.items().reduce((sum, item) => {
            const eSum = (item.selectedExtras || []).reduce((s, e) => s + e.price, 0);
            return sum + (item.price + eSum) * item.quantity;
        }, 0);
    }
}