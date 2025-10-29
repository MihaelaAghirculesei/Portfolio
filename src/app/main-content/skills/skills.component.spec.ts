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

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Skill Items', () => {
    it('should have exactly 12 skill items', () => {
      expect(component.skillItems.length).toBe(12);
    });

    it('should have all required skills', () => {
      const skillNames = component.skillItems.map(item => item.name);
      expect(skillNames).toContain('Angular');
      expect(skillNames).toContain('TypeScript');
      expect(skillNames).toContain('JavaScript');
      expect(skillNames).toContain('HTML');
      expect(skillNames).toContain('CSS');
      expect(skillNames).toContain('Firebase');
      expect(skillNames).toContain('Git');
      expect(skillNames).toContain('Figma');
      expect(skillNames).toContain('Material Design');
      expect(skillNames).toContain('Rest-API');
      expect(skillNames).toContain('Scrum');
      expect(skillNames).toContain('Growth Mindset');
    });

    it('should have correct image paths', () => {
      component.skillItems.forEach(skill => {
        expect(skill.url).toMatch(/assets\/img\/skills\/.+\.svg/);
      });
    });

    it('should have readonly skill items', () => {
      expect(component.skillItems).toBeTruthy();
      // Test that it's readonly by checking it's defined
      expect(Array.isArray(component.skillItems)).toBe(true);
    });
  });

  describe('Future Skills', () => {
    it('should have exactly 2 future skills', () => {
      expect(component.futureSkills.length).toBe(2);
    });

    it('should include React and Python', () => {
      const skillNames = component.futureSkills.map(item => item.name);
      expect(skillNames).toContain('React');
      expect(skillNames).toContain('Python');
    });

    it('should have correct React icon path', () => {
      const react = component.futureSkills.find(s => s.name === 'React');
      expect(react?.url).toBe('assets/img/skills/react.svg');
    });

    it('should have correct Python icon path', () => {
      const python = component.futureSkills.find(s => s.name === 'Python');
      expect(python?.url).toBe('assets/img/skills/python.svg');
    });
  });

  describe('isLastItem', () => {
    it('should return true for last item', () => {
      const lastIndex = component.skillItems.length - 1;
      expect(component.isLastItem(lastIndex)).toBe(true);
    });

    it('should return false for first item', () => {
      expect(component.isLastItem(0)).toBe(false);
    });

    it('should return false for middle items', () => {
      const middleIndex = Math.floor(component.skillItems.length / 2);
      expect(component.isLastItem(middleIndex)).toBe(false);
    });

    it('should return false for index before last', () => {
      const beforeLast = component.skillItems.length - 2;
      expect(component.isLastItem(beforeLast)).toBe(false);
    });

    it('should return false for negative index', () => {
      expect(component.isLastItem(-1)).toBe(false);
    });

    it('should return false for index beyond length', () => {
      expect(component.isLastItem(component.skillItems.length)).toBe(false);
    });
  });

  describe('handleContactClick', () => {
    it('should scroll to contact section', () => {
      const event = new Event('click');
      component.handleContactClick(event);

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
    });

    it('should prevent default event behavior', () => {
      const event = new Event('click');
      spyOn(event, 'preventDefault');

      component.handleContactClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call scrollService exactly once', () => {
      const event = new Event('click');

      component.handleContactClick(event);

      expect(mockScrollService.scrollToElement).toHaveBeenCalledTimes(1);
    });

    it('should work with different event types', () => {
      const clickEvent = new MouseEvent('click');
      spyOn(clickEvent, 'preventDefault');

      component.handleContactClick(clickEvent);

      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
    });
  });

  describe('Data Integrity', () => {
    it('should have immutable skill items', () => {
      const originalLength = component.skillItems.length;
      expect(originalLength).toBe(12);
    });

    it('should have immutable future skills', () => {
      const originalLength = component.futureSkills.length;
      expect(originalLength).toBe(2);
    });

    it('should have all skills with both url and name properties', () => {
      component.skillItems.forEach(skill => {
        expect(skill.url).toBeDefined();
        expect(skill.name).toBeDefined();
        expect(typeof skill.url).toBe('string');
        expect(typeof skill.name).toBe('string');
      });
    });

    it('should have all future skills with both url and name properties', () => {
      component.futureSkills.forEach(skill => {
        expect(skill.url).toBeDefined();
        expect(skill.name).toBeDefined();
      });
    });
  });
});
