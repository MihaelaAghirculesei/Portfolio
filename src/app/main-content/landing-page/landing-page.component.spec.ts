import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LandingpageComponent } from './landing-page.component';
import { ScrollService } from '../../shared/services/scroll.service';

describe('LandingpageComponent', () => {
  let component: LandingpageComponent;
  let fixture: ComponentFixture<LandingpageComponent>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;

  beforeEach(async () => {
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement']);

    await TestBed.configureTestingModule({
      imports: [LandingpageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ScrollService, useValue: mockScrollService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Profile Info', () => {
    it('should have correct profile information', () => {
      expect(component.profileInfo.firstName).toBe('Mihaela Melania');
      expect(component.profileInfo.lastName).toBe('Aghirculesei');
      expect(component.profileInfo.email).toBe('kontakt@mihaela-melania-aghirculesei.de');
    });
  });

  describe('Action Buttons', () => {
    it('should have 2 action buttons', () => {
      expect(component.actionButtons.length).toBe(2);
    });

    it('should have primary button for checking work', () => {
      const primaryButton = component.actionButtons.find(btn => btn.primary);
      expect(primaryButton).toBeDefined();
      expect(primaryButton?.labelKey).toBe('landingPage.checkWork');
    });

    it('should have secondary button for contact', () => {
      const secondaryButton = component.actionButtons.find(btn => !btn.primary);
      expect(secondaryButton).toBeDefined();
      expect(secondaryButton?.labelKey).toBe('landingPage.contactMe');
    });

    it('should execute correct action for check work button', () => {
      spyOn(component, 'scrollToProjects');
      const checkWorkButton = component.actionButtons[0];
      checkWorkButton.action();
      expect(component.scrollToProjects).toHaveBeenCalled();
    });

    it('should execute correct action for contact button', () => {
      spyOn(component, 'scrollToContact');
      const contactButton = component.actionButtons[1];
      contactButton.action();
      expect(component.scrollToContact).toHaveBeenCalled();
    });
  });

  describe('Social Links', () => {
    it('should have 3 social links', () => {
      expect(component.socialLinks.length).toBe(3);
    });

    it('should have email link', () => {
      const emailLink = component.socialLinks.find(link => link.alt === 'Email');
      expect(emailLink).toBeDefined();
      expect(emailLink?.url).toContain('mailto:');
      expect(emailLink?.isExternal).toBe(false);
    });

    it('should have GitHub link', () => {
      const githubLink = component.socialLinks.find(link => link.alt === 'GitHub');
      expect(githubLink).toBeDefined();
      expect(githubLink?.url).toContain('github.com');
      expect(githubLink?.isExternal).toBe(true);
    });

    it('should have LinkedIn link', () => {
      const linkedInLink = component.socialLinks.find(link => link.alt === 'LinkedIn');
      expect(linkedInLink).toBeDefined();
      expect(linkedInLink?.url).toContain('linkedin.com');
      expect(linkedInLink?.isExternal).toBe(true);
    });
  });

  describe('Scroll Methods', () => {
    it('should scroll to about me section', () => {
      component.scrollToAboutMe();
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('aboutMe', 'start');
    });

    it('should scroll to projects section', () => {
      component.scrollToProjects();
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('projects', 'start');
    });

    it('should scroll to contact section', () => {
      component.scrollToContact();
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should have ngOnInit method', () => {
      expect(component.ngOnInit).toBeDefined();
      component.ngOnInit();
    });

    it('should have ngOnDestroy method', () => {
      expect(component.ngOnDestroy).toBeDefined();
      component.ngOnDestroy();
    });
  });
});
