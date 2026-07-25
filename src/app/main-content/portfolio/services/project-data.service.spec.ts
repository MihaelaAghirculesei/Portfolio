import { TestBed } from '@angular/core/testing';
import { ProjectDataService } from './project-data.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { Projects } from '../../../interfaces/projects';

describe('ProjectDataService', () => {
  let service: ProjectDataService;
  let translateService: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectDataService);
    translateService = TestBed.inject(TranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load projects from the projects data file', () => {
    expect(service.projects.length).toBeGreaterThan(0);
  });

  describe('hasTechIcon', () => {
    it('should return true for a known technology', () => {
      expect(service.hasTechIcon('Angular')).toBe(true);
      expect(service.hasTechIcon('TypeScript')).toBe(true);
    });

    it('should return false for an unknown technology', () => {
      expect(service.hasTechIcon('UnknownTech')).toBe(false);
    });
  });

  describe('getTechIconPath', () => {
    it('should return the icon path for a known technology', () => {
      expect(service.getTechIconPath('Angular')).toBe('assets/img/projects/icons/angular.svg');
      expect(service.getTechIconPath('Firebase')).toBe('assets/img/projects/icons/firebase.svg');
    });

    it('should return null for an unknown technology', () => {
      expect(service.getTechIconPath('UnknownTech')).toBeNull();
    });

    it('should normalize spaces, dashes and dots before lookup', () => {
      expect(service.getTechIconPath('REST API')).toBe('assets/img/projects/icons/rest-api.svg');
      expect(service.getTechIconPath('Material Design')).toBe('assets/img/projects/icons/material-design.svg');
      expect(service.getTechIconPath('OAuth 2.0')).toBe('assets/img/projects/icons/oauth.svg');
    });

    it('should be case-insensitive', () => {
      expect(service.getTechIconPath('ANGULAR')).toBe('assets/img/projects/icons/angular.svg');
      expect(service.getTechIconPath('angular')).toBe('assets/img/projects/icons/angular.svg');
    });
  });

  describe('getProjectScreenshotAlt', () => {
    const projects: Projects[] = [
      { id: 'a', name: 'Join', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
      { id: 'b', name: '', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
    ];

    it('should return the project name with "screenshot" suffix for a valid index', () => {
      expect(service.getProjectScreenshotAlt(0, projects)).toBe('Join screenshot');
    });

    it('should return the default alt text for a null index', () => {
      expect(service.getProjectScreenshotAlt(null, projects)).toBe('Project screenshot');
    });

    it('should return the default alt text for a negative index', () => {
      expect(service.getProjectScreenshotAlt(-1, projects)).toBe('Project screenshot');
    });

    it('should return the default alt text for an out-of-range index', () => {
      expect(service.getProjectScreenshotAlt(99, projects)).toBe('Project screenshot');
    });

    it('should return the default alt text when the project name is empty', () => {
      expect(service.getProjectScreenshotAlt(1, projects)).toBe('Project screenshot');
    });

    it('should default to service.projects when no projects array is provided', () => {
      const alt = service.getProjectScreenshotAlt(0);
      expect(alt).toBe(`${service.projects[0].name} screenshot`);
    });
  });

  describe('getProjectShortDescription', () => {
    it('should translate using the project id when present', () => {
      spyOn(translateService, 'instant').and.returnValue('Kurzbeschreibung');
      const project: Projects = { id: 'join', name: 'Join', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' };

      const result = service.getProjectShortDescription(project);

      expect(translateService.instant).toHaveBeenCalledWith('projects.join.shortDescription');
      expect(result).toBe('Kurzbeschreibung');
    });

    it('should fall back to the default translation key when id is missing', () => {
      spyOn(translateService, 'instant').and.returnValue('Default short');
      const project = { name: 'Unknown', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' } as unknown as Projects;

      const result = service.getProjectShortDescription(project);

      expect(translateService.instant).toHaveBeenCalledWith('projects.default.shortDescription');
      expect(result).toBe('Default short');
    });
  });

  describe('getProjectDescription', () => {
    it('should translate using the project id when present', () => {
      spyOn(translateService, 'instant').and.returnValue('Full description');
      const project: Projects = { id: 'join', name: 'Join', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' };

      const result = service.getProjectDescription(project);

      expect(translateService.instant).toHaveBeenCalledWith('projects.join.description');
      expect(result).toBe('Full description');
    });

    it('should return the raw description when id is missing', () => {
      spyOn(translateService, 'instant');
      const project = {
        name: 'Unknown',
        technologies: [],
        previewImg: '',
        description: 'Static desc',
        githubUrl: '',
        liveUrl: '',
      } as unknown as Projects;

      const result = service.getProjectDescription(project);

      expect(translateService.instant).not.toHaveBeenCalled();
      expect(result).toBe('Static desc');
    });

    it('should return an empty string when id and description are both missing', () => {
      const project = { name: 'Unknown', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' } as unknown as Projects;

      const result = service.getProjectDescription(project);

      expect(result).toBe('');
    });
  });
});
