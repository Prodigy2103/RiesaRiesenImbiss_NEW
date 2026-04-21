import { Injectable, signal, inject, NgZone } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, updateDoc, doc, orderBy, deleteDoc, Unsubscribe, DocumentChange, QuerySnapshot } from '@angular/fire/firestore';
import { Order, OrderStatus } from '../modals/order.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private firestore = inject(Firestore);
    private zone = inject(NgZone);

    public orders = signal<Order[]>([]);
    private unsubscribe: Unsubscribe | null = null;
    private isInitialLoad = true;

    public startListening(): void {
        if (this.unsubscribe) return;

        const q = query(
            collection(this.firestore, 'orders'),
            where('status', '!=', 'done'),
            orderBy('status', 'asc'),
            orderBy('createdAt', 'asc')
        );

        this.unsubscribe = onSnapshot(q, (snapshot) => {
            this.zone.run(() => this.processSnapshot(snapshot as QuerySnapshot<Order>));
        }, (error) => console.error("Firebase Error:", error));
    }

    private processSnapshot(snapshot: QuerySnapshot<Order>): void {
        const updated = snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id
        }));
        
        this.orders.set(updated);
        this.handleNotificationSound(snapshot);
        this.isInitialLoad = false;
    }

    public stopListening(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    private handleNotificationSound(snapshot: QuerySnapshot<Order>): void {
        if (this.isInitialLoad) return;

        snapshot.docChanges().forEach((change: DocumentChange<Order>) => {
            if (change.type === 'added' && change.doc.data().status === 'new') {
                this.playNotificationSound();
            }
        });
    }

    private playNotificationSound(): void {
        const audio = new Audio('assets/sounds/kakaist-ding-sfx-330333.mp3');
        audio.play().catch(err => console.warn("Audio blocked:", err));
    }

    public async updateStatus(id: string, status: OrderStatus): Promise<void> {
        const docRef = doc(this.firestore, 'orders', id);
        await updateDoc(docRef, { status });
    }

    public async deleteOrder(id: string): Promise<void> {
        const docRef = doc(this.firestore, 'orders', id);
        await deleteDoc(docRef);
    }

    public getLiveOrder(orderId: string): Observable<Order> {
        return new Observable<Order>(sub => {
            const docRef = doc(this.firestore, 'orders', orderId);
            return onSnapshot(docRef, (snap) => {
                this.zone.run(() => {
                    if (snap.exists()) sub.next({ ...snap.data(), id: snap.id } as Order);
                });
            }, (err) => sub.error(err));
        });
    }
}