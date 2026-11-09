import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, where, Timestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, map, Observable } from 'rxjs';
import { OrderItem, Category, IngredientDetail, Order } from '../modals/order.model';

export type NewOrderPayload = Omit<Order, 'id' | 'createdAt' | 'status'>;

export interface DayTimestampRange {
    start: Timestamp;
    end: Timestamp;
}

export function calculateDayTimestampRange(targetDate: Date): DayTimestampRange {
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    return {
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate)
    };
}

export function normalizeCategory(documentIdentifier: string, sourceCategory: Category): Category {
    const rawImage = (sourceCategory.img || '').trim();
    const normalizedImage = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
    return {
        ...sourceCategory,
        id: documentIdentifier,
        key: (sourceCategory.key || documentIdentifier).trim(),
        img: normalizedImage,
        order: Number(sourceCategory.order || 0)
    };
}

const STREET_WITH_HOUSE_NUMBER_PATTERN = /[A-Za-zÄÖÜäöüß]{2,}[A-Za-zÄÖÜäöüß.\s-]*\s+\d{1,4}[a-zA-Z]?(?:[-/]\d{1,4}[a-zA-Z]?)?\b/;

export function isValidDeliveryAddress(rawAddress: string): boolean {
    const normalizedAddress = rawAddress.trim();
    return normalizedAddress.length >= 5 && STREET_WITH_HOUSE_NUMBER_PATTERN.test(normalizedAddress);
}

export function normalizeMenuItem(documentIdentifier: string, sourceItem: OrderItem): OrderItem {
    const rawPath = sourceItem.imgPath || '';
    const normalizedImagePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return {
        ...sourceItem,
        id: documentIdentifier,
        imgPath: normalizedImagePath,
        ingredients: Array.isArray(sourceItem.ingredients) ? sourceItem.ingredients : []
    };
}

@Injectable({ providedIn: 'root' })
export class DataService {
    private readonly firestore: Firestore = inject(Firestore);
    public readonly ingredientDetailsMap: WritableSignal<Record<string, IngredientDetail>> = signal<Record<string, IngredientDetail>>({});

    constructor() {
        this.loadIngredientDetails();
    }

    private async loadIngredientDetails(): Promise<void> {
        const querySnapshot = await getDocs(collection(this.firestore, 'ingredient-details'));
        const ingredientDictionary: Record<string, IngredientDetail> = {};

        querySnapshot.docs.forEach(documentSnapshot => {
            const detailPayload = documentSnapshot.data() as IngredientDetail;
            const stringIdentifier = (detailPayload.id ?? documentSnapshot.id).toString();
            ingredientDictionary[stringIdentifier] = { ...detailPayload, id: stringIdentifier };
        });
        this.ingredientDetailsMap.set(ingredientDictionary);
    }

    public readonly categories: Signal<Category[]> = toSignal(
        from(getDocs(query(collection(this.firestore, 'categories'), orderBy('order', 'asc')))).pipe(
            map(querySnapshot => querySnapshot.docs.map(documentSnapshot =>
                normalizeCategory(documentSnapshot.id, documentSnapshot.data() as Category)
            ))
        ),
        { initialValue: [] }
    );

    public readonly menuItems: Signal<OrderItem[]> = toSignal(
        from(getDocs(query(collection(this.firestore, 'menuItems_New'), orderBy('order', 'asc')))).pipe(
            map(querySnapshot => querySnapshot.docs.map(documentSnapshot =>
                normalizeMenuItem(documentSnapshot.id, documentSnapshot.data() as OrderItem)
            ))
        ),
        { initialValue: [] }
    );

    async sendOrder(orderPayload: NewOrderPayload): Promise<string> {
        this.validateCustomerPayload(orderPayload);
        const ordersCollection = collection(this.firestore, 'orders');
        const documentReference = await addDoc(ordersCollection, {
            ...orderPayload,
            createdAt: serverTimestamp(),
            status: 'new'
        });
        return documentReference.id;
    }

    private validateCustomerPayload(orderPayload: NewOrderPayload): void {
        const { name, phone, address } = orderPayload.customer;
        const isBasicDataInvalid = !name || name.trim().length < 5 || !phone || phone.trim().length < 5;
        const isDeliveryAddressInvalid = orderPayload.deliveryType === 'delivery' && !isValidDeliveryAddress(address);
        if (isBasicDataInvalid || isDeliveryAddressInvalid) {
            throw new Error('SYSTEM_FAILURE: Invalid Customer Data (Name, Phone or Delivery Address invalid)');
        }
    }

    public async getOrdersByDate(targetDate: Date): Promise<Order[]> {
        const dayRange: DayTimestampRange = calculateDayTimestampRange(targetDate);
        const ordersQuery = this.buildOrdersByDateQuery(dayRange);
        const ordersSnapshot = await getDocs(ordersQuery);
        return ordersSnapshot.docs.map(documentSnapshot => ({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
        } as Order));
    }

    private buildOrdersByDateQuery(dayRange: DayTimestampRange) {
        return query(
            collection(this.firestore, 'orders'),
            where('createdAt', '>=', dayRange.start),
            where('createdAt', '<=', dayRange.end),
            orderBy('createdAt', 'desc')
        );
    }

    getIngredient(ingredientIdentifier: number | string): IngredientDetail | undefined {
        return this.ingredientDetailsMap()[ingredientIdentifier.toString()];
    }

    public readonly ingredientsList: Signal<IngredientDetail[]> = computed(() =>
        Object.values(this.ingredientDetailsMap())
    );

    public getIngredientsList(): Signal<IngredientDetail[]> {
        return this.ingredientsList;
    }
}