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

    const activeOrdersQuery = query(
      collection(this.firestore, 'orders'),
      where('status', '!=', 'done'),
      orderBy('status', 'asc'),
      orderBy('createdAt', 'asc')
    );

    this.unsubscribe = onSnapshot(activeOrdersQuery, (snapshot) => {
      this.zone.run(() => this.processSnapshot(snapshot as QuerySnapshot<Order>));
    }, (firebaseError) => console.error('Firebase Error:', firebaseError));
  }

  private processSnapshot(snapshot: QuerySnapshot<Order>): void {
    const updatedOrders = snapshot.docs
      .filter(docSnapshot => docSnapshot.exists())
      .map(docSnapshot => ({ ...docSnapshot.data(), id: docSnapshot.id }));

    this.orders.set(updatedOrders);
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
    const notificationAudio = new Audio('assets/sounds/kakaist-ding-sfx-330333.mp3');
    notificationAudio.play().catch(audioError => console.warn('Audio blocked:', audioError));
  }

  public async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const documentReference = doc(this.firestore, 'orders', orderId);
    await updateDoc(documentReference, { status });
  }

  public async deleteOrder(orderId: string): Promise<void> {
    const documentReference = doc(this.firestore, 'orders', orderId);
    await deleteDoc(documentReference);
  }

  public getLiveOrder(orderId: string): Observable<Order> {
    return new Observable<Order>(subscriber => {
      const documentReference = doc(this.firestore, 'orders', orderId);
      return onSnapshot(documentReference, (docSnapshot) => {
        this.zone.run(() => {
          if (docSnapshot.exists()) {
            subscriber.next({ ...docSnapshot.data(), id: docSnapshot.id } as Order);
          }
        });
      }, (streamError) => subscriber.error(streamError));
    });
  }
}