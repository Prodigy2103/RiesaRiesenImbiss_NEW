import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterModalsComponent } from './footer-modals.component';

describe('FooterModalsComponent', () => {
  let component: FooterModalsComponent;
  let fixture: ComponentFixture<FooterModalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterModalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
