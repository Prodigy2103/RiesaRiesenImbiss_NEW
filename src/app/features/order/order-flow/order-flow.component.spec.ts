import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SAUCE_INFO_LIST } from '../../../shared/modals/extras.data';
import { OrderFlowComponent } from './order-flow.component';
import { Category } from '../../../shared/modals/order.model';

describe('OrderFlowComponent', () => {
  let component: OrderFlowComponent;
  let fixture: ComponentFixture<OrderFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFlowComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load SAUCE_INFO_LIST into the signal when taco category is clicked', () => {
    // 1. Arrange: Wir bauen ein Mock-Objekt mit der richtigen ID
    const tacoCat = { id: 'CVnnpJ5lvCwIeOHeEc0Z' } as Category;
    const event = new MouseEvent('click');

    // 2. Act: Methode triggern
    component.handleDescriptionClick(tacoCat, event);

    // 3. Assert: Test-Check
    // Wir prüfen, ob der Inhalt des Signals exakt unserer statischen Liste entspricht
    expect(component.selectedIngredientInfo()).toEqual(SAUCE_INFO_LIST);
  });
});
