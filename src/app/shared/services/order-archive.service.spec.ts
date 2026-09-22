import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { OrderArchiveService } from './order-archive.service';
import { Order } from '../modals/order.model';

describe('OrderArchiveService', () => {
    let service: OrderArchiveService;
    const firestoreMock: Partial<Firestore> = {};

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OrderArchiveService,
                { provide: Firestore, useValue: firestoreMock }
            ]
        });
        service = TestBed.inject(OrderArchiveService);
    });

    it('should throw error when archiving order without id', async () => {
        const orderWithoutId: Partial<Order> = { status: 'new' };
        await expectAsync(service.archiveOrder(orderWithoutId as Order))
            .toBeRejectedWithError('Keine Order-ID zum Archivieren gefunden');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
