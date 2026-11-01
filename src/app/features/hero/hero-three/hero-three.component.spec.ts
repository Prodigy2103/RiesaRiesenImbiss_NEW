import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HeroThreeComponent } from './hero-three.component';
import { OrderService } from '../../../shared/services/order.service';

describe('HeroThreeComponent', () => {
  let component: HeroThreeComponent;
  let fixture: ComponentFixture<HeroThreeComponent>;

  beforeEach(async () => {
    const mockOrderService = {
      step: signal(1)
    };

    await TestBed.configureTestingModule({
      imports: [HeroThreeComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the delivery announcement HUD banner with start date and zip codes', () => {
    const bannerElement = fixture.nativeElement.querySelector('.delivery-hud-banner') as HTMLElement | null;
    const bannerText = bannerElement?.textContent ?? '';

    expect(bannerElement).not.toBeNull();
    expect(bannerText).toContain('02.11.2026');
    expect(bannerText).toContain('01587');
    expect(bannerText).toContain('01589');
  });
});
