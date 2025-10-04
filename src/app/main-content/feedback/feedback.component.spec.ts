import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FeedbacksComponent } from './feedback.component';
import { PlatformService } from '../../shared/services/platform.service';

describe('FeedbacksComponent', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;

  beforeEach(async () => {
    mockPlatformService = jasmine.createSpyObj('PlatformService', ['getDocument', 'getWindow']);
    mockPlatformService.getDocument.and.returnValue(document);

    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PlatformService, useValue: mockPlatformService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have feedbacks', () => {
    expect(component.feedbacks.length).toBeGreaterThan(0);
  });

  it('should slide left', () => {
    const initialIndex = component.middleIndex;
    component.slideLeft();
    expect(component.middleIndex).not.toBe(initialIndex);
  });

  it('should slide right', () => {
    component.middleIndex = 2;
    component.slideRight();
    expect(component.middleIndex).toBe(1);
  });

  it('should wrap to last on slide right from first', () => {
    component.middleIndex = 0;
    component.slideRight();
    expect(component.middleIndex).toBe(component.feedbacks.length - 1);
  });
});
