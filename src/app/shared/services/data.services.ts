import { computed, inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, where, Timestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import { OrderItem, Category, IngredientDetail, Order } from '../modals/order.model';

@Injectable({ providedIn: 'root' })
export class DataService {
    private fire = inject(Firestore);
    public readonly ingredientDetailsMap = signal<Record<string, IngredientDetail>>({});

    constructor() {
        this.loadIngredientDetails();
    }

    private async loadIngredientDetails(): Promise<void> {
        const snap = await getDocs(collection(this.fire, 'ingredient-details'));
        const dictionary: Record<string, IngredientDetail> = {};

        snap.docs.forEach(doc => {
            const data = doc.data() as IngredientDetail;
            const stringId = (data.id ?? doc.id).toString();
            dictionary[stringId] = { ...data, id: stringId };
        });
        this.ingredientDetailsMap.set(dictionary);
    }

    public readonly categories = toSignal(
        from(getDocs(query(collection(this.fire, 'categories'), orderBy('order', 'asc')))).pipe(
            map(snap => snap.docs.map(doc => {
                const data = doc.data() as Category;
                const category: Category = {
                    ...data,
                    id: doc.id,
                    key: data.key || doc.id,
                    order: Number(data.order || 0)
                };
                return category;
            }))
        ), { initialValue: [] as Category[] }
    );

    public readonly menuItems = toSignal(
        from(getDocs(query(collection(this.fire, 'menuItems'), orderBy('order', 'asc')))).pipe(
            map(snap => snap.docs.map(doc => this.formatItem(doc.id, doc.data() as OrderItem)))
        ), { initialValue: [] as OrderItem[] }
    );

    private formatItem(docId: string, d: OrderItem): OrderItem {
        const img = d.imgPath?.startsWith('/') ? d.imgPath : `/${d.imgPath}`;
        return {
            ...d,
            id: docId,
            imgPath: img,
            ingredients: Array.isArray(d.ingredients) ? d.ingredients : []
        };
    }

    async sendOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> {
        const { name, phone } = orderData.customer;

        // Senior-Schutzschild: Harte Validierung
        if (!name || name.length < 5 || !phone || phone.trim().length < 5) {
            throw new Error('SYSTEM_FAILURE: Invalid Customer Data (Name or Phone missing)');
        }

        const docRef = await addDoc(collection(this.fire, 'orders'), {
            ...orderData,
            createdAt: serverTimestamp(),
            status: 'new'
        });

        return docRef.id;
    }

    public async getOrdersByDate(date: Date): Promise<Order[]> {
        const range = this.calculateDayRange(date);
        const q = query(
            collection(this.fire, 'orders'),
            where('createdAt', '>=', range.start),
            where('createdAt', '<=', range.end),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    }

    private calculateDayRange(date: Date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return {
            start: Timestamp.fromDate(start),
            end: Timestamp.fromDate(end)
        };
    }

    getIngredient(id: number | string): IngredientDetail | undefined {
        return this.ingredientDetailsMap()[id.toString()];
    }

    public getIngredientsList() {
        return computed(() => Object.values(this.ingredientDetailsMap()));
    }
}