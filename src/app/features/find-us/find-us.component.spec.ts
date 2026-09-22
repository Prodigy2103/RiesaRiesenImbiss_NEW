import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FindUsComponent } from './find-us.component';
import { ReviewService } from '../../shared/services/review.service';

describe('FindUsComponent', () => {
  let component: FindUsComponent;
  let fixture: ComponentFixture<FindUsComponent>;
  let reviewService: ReviewService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FindUsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FindUsComponent);
    component = fixture.componentInstance;
    reviewService = TestBed.inject(ReviewService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle admin mode correctly', () => {
    expect(component.adminMode()).toBeFalse();
    component.toggleAdmin();
    expect(component.adminMode()).toBeTrue();
  });

  it('should calculate star fill correctly based on rating', () => {
    expect(component.getStarFill(0, 4)).toBe('100%');
    expect(component.getStarFill(4, 4.5)).toBe('50%');
    expect(component.getStarFill(4, 3)).toBe('0%');
  });

  it('should display error toast when submitting invalid feedback', () => {
    component.userName = '';
    component.userComment = '';
    component.currentRating = 0;

    component.submitFeedback();

    expect(component.toastMessage()).toContain('SYSTEM ERROR');
    expect(component.toastSeverity()).toBe('error');
  });

  it('should display success toast and reset form on valid feedback', () => {
    const initialCount = reviewService.comments().length;
    component.userName = 'Tester';
    component.userComment = 'Toller Service';
    component.currentRating = 5;

    component.submitFeedback();

    expect(reviewService.comments().length).toBe(initialCount + 1);
    expect(component.toastMessage()).toContain('LOG RECORDED');
    expect(component.toastSeverity()).toBe('success');
    expect(component.userName).toBe('');
    expect(component.userComment).toBe('');
  });

  it('should dismiss active toast when dismissToast is called', () => {
    component.displayToast('TEST NOTICE', 'success');
    expect(component.toastMessage()).toBe('TEST NOTICE');

    component.dismissToast();
    expect(component.toastMessage()).toBeNull();
  });

  it('should not delete comments if adminMode is disabled', () => {
    const commentsList = reviewService.comments();
    const targetCommentId = commentsList[0]?.id ?? '';

    component.adminMode.set(false);
    component.deleteComment(targetCommentId);

    expect(reviewService.comments().some(comment => comment.id === targetCommentId)).toBeTrue();
  });
});
