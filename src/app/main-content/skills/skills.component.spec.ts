import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SkillsComponent } from './skills.component';
import { ScrollService } from '../../shared/services/scroll.service';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;

  beforeEach(async () => {
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement']);

    await TestBed.configureTestingModule({
      imports: [SkillsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ScrollService, useValue: mockScrollService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have skill items', () => {
    expect(component.skillItems.length).toBeGreaterThan(0);
  });

  it('should have future skills', () => {
    expect(component.futureSkills.length).toBeGreaterThan(0);
  });

  it('should check if item is last', () => {
    const lastIndex = component.skillItems.length - 1;
    expect(component.isLastItem(lastIndex)).toBe(true);
    expect(component.isLastItem(0)).toBe(false);
  });

  it('should scroll to contact on handleContactClick', () => {
    const event = new Event('click');
    component.handleContactClick(event);
    expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
  });
});
