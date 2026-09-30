export interface Projects {
  id: string;
  name: string;
  technologies: string[];
  previewImg: string;
  previewImgSrcset?: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  localOnly?: boolean;
  isPersonal?: boolean;
  isTeam?: boolean;
  inProgress?: boolean;
  featured?: boolean;
  caseStudyRoute?: string;
}
