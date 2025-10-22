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

    it('should return full name', () => {
      expect(component.fullName).toBe('Mihaela Melania Aghirculesei');
    });
  });

  describe('Action Buttons', () => {
    it('should have 2 action buttons', () => {
      expect(component.actionButtons.length).toBe(2);
    });

    it('should have button for checking work', () => {
      const checkWorkButton = component.actionButtons.find(btn => btn.labelKey === 'landingPage.checkWork');
      expect(checkWorkButton).toBeDefined();
      expect(checkWorkButton?.labelKey).toBe('landingPage.checkWork');
    });

    it('should have button for contact', () => {
      const contactButton = component.actionButtons.find(btn => btn.labelKey === 'landingPage.contactMe');
      expect(contactButton).toBeDefined();
      expect(contactButton?.labelKey).toBe('landingPage.contactMe');
    });

    it('should scroll to projects when check work button action is called', () => {
      spyOn(component, 'scrollTo');
      const checkWorkButton = component.actionButtons[0];
      checkWorkButton.action();
      expect(component.scrollTo).toHaveBeenCalledWith('projects');
    });

    it('should scroll to contact when contact button action is called', () => {
      spyOn(component, 'scrollTo');
      const contactButton = component.actionButtons[1];
      contactButton.action();
      expect(component.scrollTo).toHaveBeenCalledWith('contact');
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
      expect(emailLink?.isEmail).toBe(true);
      expect(emailLink?.ariaLabel).toBe('Email');
    });

    it('should have GitHub link', () => {
      const githubLink = component.socialLinks.find(link => link.alt === 'GitHub');
      expect(githubLink).toBeDefined();
      expect(githubLink?.url).toContain('github.com');
      expect(githubLink?.isExternal).toBe(true);
      expect(githubLink?.ariaLabel).toBe('GitHub (opens in new tab)');
    });

    it('should have LinkedIn link', () => {
      const linkedInLink = component.socialLinks.find(link => link.alt === 'LinkedIn');
      expect(linkedInLink).toBeDefined();
      expect(linkedInLink?.url).toContain('linkedin.com');
      expect(linkedInLink?.isExternal).toBe(true);
      expect(linkedInLink?.ariaLabel).toBe('LinkedIn (opens in new tab)');
    });
  });

  describe('Scroll Methods', () => {
    it('should scroll to specified element', () => {
      component.scrollTo('aboutMe');
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('aboutMe', 'start');
    });

    it('should scroll to projects section', () => {
      component.scrollTo('projects');
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('projects', 'start');
    });

    it('should scroll to contact section', () => {
      component.scrollTo('contact');
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
    });
  });

});
