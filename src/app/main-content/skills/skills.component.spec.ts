import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillsComponent } from './skills.component';
import { ScrollService } from '../../shared/services/scroll.service';

const EXPECTED_SKILL_NAMES = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'SASS', 'Tailwind CSS',
  'Angular', 'NgRx', 'RxJS', 'Material Design',
  'Next.js',
  'GSAP', 'Framer Motion',
  'Firebase', 'Rest-API',
  'PWA', 'SSR', 'Capacitor',
  'Python', 'FastAPI', 'SQLAlchemy', 'Pydantic 2', 'SQLite', 'PostgreSQL', 'Pytest',
  'Vite', 'Vitest', 'Playwright', 'Cypress', 'Workbox', 'Sentry', 'IndexedDB', 'Zod',
  'Git', 'Figma', 'Scrum',
  'Growth Mindset',
];

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;

  beforeEach(async () => {
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement']);

    await TestBed.configureTestingModule({
      imports: [SkillsComponent],
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
    it('should have the expected number of skill items', () => {
      expect(component.skillItems.length).toBe(EXPECTED_SKILL_NAMES.length);
    });

    it('should contain exactly the expected skills, no more and no less', () => {
      const skillNames = component.skillItems.map(item => item.name);
      expect(skillNames.slice().sort()).toEqual(EXPECTED_SKILL_NAMES.slice().sort());
    });

    it('should have correct image paths', () => {
      component.skillItems.forEach(skill => {
        expect(skill.url).toMatch(/^assets\/img\/skills\/.+\.svg$/);
      });
    });

    it('should have Python in main skill items', () => {
      const python = component.skillItems.find(s => s.name === 'Python');
      expect(python?.url).toBe('assets/img/skills/python.svg');
    });

    it('should not contain duplicate skill names', () => {
      const names = component.skillItems.map(item => item.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should not contain duplicate icon paths', () => {
      const urls = component.skillItems.map(item => item.url);
      expect(new Set(urls).size).toBe(urls.length);
    });
  });

  describe('Future Skills', () => {
    it('should have exactly 1 future skill', () => {
      expect(component.futureSkills.length).toBe(1);
    });

    it('should include React', () => {
      const skillNames = component.futureSkills.map(item => item.name);
      expect(skillNames).toContain('React');
    });

    it('should have correct React icon path', () => {
      const react = component.futureSkills.find(s => s.name === 'React');
      expect(react?.url).toBe('assets/img/skills/react.svg');
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

  describe('Data Shape', () => {
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

  describe('Template Rendering', () => {
    it('should render one .skillDiv per skill item', () => {
      const skillDivs = fixture.nativeElement.querySelectorAll('.skillDiv');
      expect(skillDivs.length).toBe(component.skillItems.length);
    });

    it('should render the tooltip only on the last skill item', () => {
      const skillDivs: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.skillDiv');

      skillDivs.forEach((div, index) => {
        const tooltip = div.querySelector('.tooltip');
        if (index === skillDivs.length - 1) {
          expect(tooltip).withContext(`item ${index} should have a tooltip`).not.toBeNull();
        } else {
          expect(tooltip).withContext(`item ${index} should not have a tooltip`).toBeNull();
        }
      });
    });

    it('should render each future skill inside the tooltip', () => {
      const futureSkillItems = fixture.nativeElement.querySelectorAll('.future-skills .skillItem');
      expect(futureSkillItems.length).toBe(component.futureSkills.length);
    });

    it('should render skill items in data order with matching name and icon', () => {
      const skillDivs: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.skillDiv');

      skillDivs.forEach((div, index) => {
        const expected = component.skillItems[index];
        const img = div.querySelector('img');

        expect(img?.getAttribute('src')).toBe(expected.url);
        expect(img?.getAttribute('alt')).toBe(`${expected.name} logo`);
        expect(div.querySelector('p')?.textContent?.trim()).toBe(expected.name);
      });
    });
  });

  describe('Accessibility', () => {
    it('should mark the tooltip with role="tooltip"', () => {
      const tooltip: HTMLElement | null = fixture.nativeElement.querySelector('.tooltip');
      expect(tooltip?.getAttribute('role')).toBe('tooltip');
    });

    it('should give the contact CTA a button role and a non-empty aria-label', () => {
      const cta: HTMLElement | null = fixture.nativeElement.querySelector('.link-button');
      expect(cta?.getAttribute('role')).toBe('button');
      expect(cta?.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
