import { inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import { OrderItem, Category, IngredientDetail, Order } from '../modals/order.model';

@Injectable({ providedIn: 'root' })
export class DataService {
    private fire = inject(Firestore);
    private ingredientDetailsMap = signal<Record<string, IngredientDetail>>({});

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
                // Wir erstellen ein Objekt, das alle Felder von Category erfüllt
                const category: Category = {
                    ...data,
                    id: doc.id,
                    key: data.key || doc.id,
                    order: Number(data.order || 0) // Hier garantieren wir eine Zahl
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

    /**
     * Sendet eine neue Bestellung an Firestore.
     * Typsicher: Erwartet nur die Daten, die vom User kommen.
     */
    async sendOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> {
        try {
            // 1. Sicherstellen, dass keine Signals oder Funktionen im Objekt sind
            const cleanData = JSON.parse(JSON.stringify(orderData));

            const docRef = await addDoc(collection(this.fire, 'orders'), {
                ...cleanData,
                createdAt: serverTimestamp(),
                status: 'new'
            });

            return docRef.id;
        } catch (error) {
            throw error;
        }
    }

    getIngredient(id: number | string): IngredientDetail | undefined {
        return this.ingredientDetailsMap()[id.toString()];
    }
}