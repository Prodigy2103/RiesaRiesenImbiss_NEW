import { TestBed } from '@angular/core/testing';
import { ReviewService } from './review.service';
import { Comment } from '../modals/comment.model';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial default comments when storage is empty', () => {
    expect(service).toBeTruthy();
    expect(service.comments().length).toBe(2);
    expect(service.averageRating()).toBe('4.3');
  });

  it('should add comment and prepend to existing comments', () => {
    const newComment: Comment = {
      id: '999',
      author: 'CyberFan',
      text: 'Grossartiger Geschmack!',
      rating: 5
    };
    service.addComment(newComment);
    expect(service.comments()[0]).toEqual(newComment);
    expect(service.comments().length).toBe(3);
  });

  it('should delete comment by identifier and update storage', () => {
    const commentsList = service.comments();
    const commentToDelete = commentsList[0];
    service.deleteComment(commentToDelete.id);

    const remainingComments = service.comments();
    expect(remainingComments.some(comment => comment.id === commentToDelete.id)).toBeFalse();
  });

  it('should return 5.0 as default rating when comments are empty', () => {
    service.comments.set([]);
    expect(service.averageRating()).toBe('5.0');
  });

  it('should safely fall back to defaults when storage has corrupt json', () => {
    localStorage.setItem('cyber_imbiss_logs', '{invalid-json');
    const freshService = new ReviewService();
    expect(freshService.comments().length).toBe(2);
  });
});
