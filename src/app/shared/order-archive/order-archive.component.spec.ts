import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderArchiveComponent } from './order-archive.component';
import { OrderService } from '../services/order.service';
import { of } from 'rxjs';

describe('OrderArchiveComponent', () => {
  let component: OrderArchiveComponent;
  let fixture: ComponentFixture<OrderArchiveComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getArchivedOrders: jasmine.createSpy().and.returnValue(Promise.resolve([]))
    };

    await TestBed.configureTestingModule({
      imports: [OrderArchiveComponent],
      providers: [{ provide: OrderService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderArchiveComponent);
    component = fixture.componentInstance;
  });

  it('sollte beim Start orders laden', async () => {
    component.ngOnInit();
    expect(mockService.getArchivedOrders).toHaveBeenCalled();
  });
});