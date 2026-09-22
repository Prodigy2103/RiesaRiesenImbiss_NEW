import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderArchiveComponent } from './order-archive.component';
import { OrderService } from '../services/order.service';

describe('OrderArchiveComponent', () => {
  let component: OrderArchiveComponent;
  let fixture: ComponentFixture<OrderArchiveComponent>;
  let mockOrderService: jasmine.SpyObj<Pick<OrderService, 'getArchiveRange'>>;

  beforeEach(async () => {
    mockOrderService = {
      getArchiveRange: jasmine.createSpy('getArchiveRange').and.resolveTo([])
    };

    await TestBed.configureTestingModule({
      imports: [OrderArchiveComponent],
      providers: [{ provide: OrderService, useValue: mockOrderService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderArchiveComponent);
    component = fixture.componentInstance;
  });

  it('sollte beim Start orders laden', async () => {
    component.ngOnInit();
    expect(mockOrderService.getArchiveRange).toHaveBeenCalled();
  });
});