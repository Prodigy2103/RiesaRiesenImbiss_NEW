import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, writeBatch, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Order, OrderStatus } from '../modals/order.model';

export interface DateRangeBoundary {
    startDate: Date;
    endDate: Date;
}

export interface ArchivedOrderDocument extends Omit<Order, 'status'> {
    archivedAt: Date;
    status: 'archived' | OrderStatus;
}

@Injectable({ providedIn: 'root' })
export class OrderArchiveService {
    private readonly firestore: Firestore = inject(Firestore);

    async archiveOrder(orderToArchive: Order): Promise<void> {
        this.validateOrderIdentifier(orderToArchive.id);
        const batchOperation = writeBatch(this.firestore);
        const archiveReference = doc(this.firestore, `archivedOrders/${orderToArchive.id}`);
        const activeReference = doc(this.firestore, `orders/${orderToArchive.id}`);
        batchOperation.set(archiveReference, this.createArchivedOrderPayload(orderToArchive));
        batchOperation.delete(activeReference);
        await batchOperation.commit();
    }

    async getArchivedOrders(dateString: string): Promise<Order[]> {
        const boundary: DateRangeBoundary = this.createSingleDayBoundary(dateString);
        return this.queryArchivedOrdersByDateRange(boundary);
    }

    async getArchiveRange(endDateString: string): Promise<Order[]> {
        const boundary: DateRangeBoundary = this.createWeekRangeBoundary(endDateString);
        return this.queryArchivedOrdersByDateRange(boundary);
    }

    private validateOrderIdentifier(orderIdentifier?: string): void {
        if (!orderIdentifier) {
            throw new Error('Keine Order-ID zum Archivieren gefunden');
        }
    }

    private createArchivedOrderPayload(orderToArchive: Order): ArchivedOrderDocument {
        return {
            ...orderToArchive,
            archivedAt: new Date(),
            status: 'archived'
        };
    }

    private createSingleDayBoundary(dateString: string): DateRangeBoundary {
        return {
            startDate: new Date(`${dateString}T00:00:00`),
            endDate: new Date(`${dateString}T23:59:59`)
        };
    }

    private createWeekRangeBoundary(endDateString: string): DateRangeBoundary {
        const startDate = new Date(`${endDateString}T00:00:00`);
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date(`${endDateString}T23:59:59`);
        return { startDate, endDate };
    }

    private async queryArchivedOrdersByDateRange(boundary: DateRangeBoundary): Promise<Order[]> {
        const archiveCollection = collection(this.firestore, 'archivedOrders');
        const rangeQuery = query(
            archiveCollection,
            where('createdAt', '>=', boundary.startDate),
            where('createdAt', '<=', boundary.endDate)
        );
        const querySnapshot = await getDocs(rangeQuery);
        return this.mapSnapshotToOrders(querySnapshot);
    }

    private mapSnapshotToOrders(querySnapshot: QuerySnapshot<DocumentData>): Order[] {
        return querySnapshot.docs.map(documentSnapshot => ({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
        } as Order));
    }
}
