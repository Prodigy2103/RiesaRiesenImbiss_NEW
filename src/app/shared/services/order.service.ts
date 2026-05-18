import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { OrderItem, CustomerData, Order } from '../modals/order.model';
import { collection, doc, Firestore, getDocs, query, where, writeBatch } from '@angular/fire/firestore';

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
    private readonly firestore = inject(Firestore);

    private readonly CUSTOMER_KEY = 'imbiss_customer';
    private readonly SUMMARY_KEY = 'last_order_summary';
    private readonly CART_KEY = 'imbiss_active_cart'; // Neuer Key für den Warenkorb

    step = signal<OrderStep>(1);
    category = signal<string | null>(null);
    deliveryType = signal<DeliveryType>('delivery');
    zipCode = signal<string>('');

    // Initialisierung direkt aus dem Storage
    items = signal<CartItem[]>(this.loadCartFromStorage());
    extras = signal<OrderItem[]>([]);
    customer = signal<CustomerData>(this.getInitialCustomer());
    summary = signal<OrderSummary | null>(this.getSavedSummary());

    constructor() {
        // Automatisches Speichern bei jeder Änderung der Items
        effect(() => {
            localStorage.setItem(this.CART_KEY, JSON.stringify(this.items()));
        });
    }

    totalItemsCount = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
    total = computed(() => this.calculateFullTotal());
    finalTotal = computed(() => this.total());

    private readonly movMap: Record<string, number> = { '01589': 25, '01587': 30 };
    minOrderValue = computed(() => this.movMap[this.zipCode()] ?? 0);
    isAreaSupported = computed(() => !!this.movMap[this.zipCode()]);
    isMovReached = computed(() => this.isAreaSupported() && this.total() >= this.minOrderValue());
    missingAmount = computed(() => Math.max(0, this.minOrderValue() - this.total()));

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

    complete(data: CustomerData): void {
        const snapshot: OrderSummary = {
            customer: { ...data },
            items: [...this.items()],
            total: this.total(),
            finalTotal: this.finalTotal(),
            deliveryType: this.deliveryType()
        };

        this.customer.set({ ...data });
        this.summary.set(snapshot);
        sessionStorage.setItem(this.SUMMARY_KEY, JSON.stringify(snapshot));
        localStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(data));
    }

    updateId(orderId: string): void {
        const current = this.summary();
        if (!current) return;
        const updated = { ...current, id: orderId };
        this.summary.set(updated);
        sessionStorage.setItem(this.SUMMARY_KEY, JSON.stringify(updated));
    }

    // Diese Methode wird gerufen, wenn die Küche "Abschließen" klickt
    reset(): void {
        this.step.set(1);
        this.items.set([]);
        this.zipCode.set('');
        this.resetExtras();
        localStorage.removeItem(this.CART_KEY); // Explizites Löschen
    }

    next(): void {
        const current = this.step();
        if (current === 2 && this.totalItemsCount() === 0) return;
        this.step.update(s => (s < 3 ? (s + 1) as OrderStep : s));
    }

    back(): void { this.step.update(s => (s > 1 ? (s - 1) as OrderStep : s)); }

    private loadCartFromStorage(): CartItem[] {
        const saved = localStorage.getItem(this.CART_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

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

    async archiveOrder(order: Order): Promise<void> {
        if (!order.id) throw new Error('Keine Order-ID zum Archivieren gefunden');

        const batch = writeBatch(this.firestore);
        const archiveRef = doc(this.firestore, `archivedOrders/${order.id}`);
        const activeRef = doc(this.firestore, `orders/${order.id}`);

        // Wir nutzen das aktuelle Datum, falls createdAt fehlt
        const createdAt = order.createdAt || new Date();

        batch.set(archiveRef, {
            ...order,
            archivedAt: new Date(),
            status: 'archived' // Status explizit ändern
        });

        batch.delete(activeRef);

        await batch.commit(); // Triggert automatisch den Snapshot-Listener im UI
    }
    async getArchivedOrders(dateStr: string): Promise<Order[]> {
        const archiveRef = collection(this.firestore, 'archivedOrders');

        const start = new Date(dateStr + 'T00:00:00');
        const end = new Date(dateStr + 'T23:59:59');

        const q = query(archiveRef,
            where('createdAt', '>=', start),
            where('createdAt', '<=', end)
        );

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    }

    async getArchiveRange(endDate: string): Promise<Order[]> {
        const start = new Date(endDate + 'T00:00:00');
        start.setDate(start.getDate() - 7);

        const end = new Date(endDate + 'T23:59:59');

        const q = query(
            collection(this.firestore, 'archivedOrders'),
            where('createdAt', '>=', start),
            where('createdAt', '<=', end)
        );

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    }
}