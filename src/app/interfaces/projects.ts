export interface HoverOffset {
  base: number;
  smallPreview: number;
}

export interface Projects {
  id: string;
  name: string;
  technologies: string[];
  previewImg: string;
  previewImgSrcset?: string;
  description?: string;
  githubUrl?: string;
  liveUrl: string;
  isPersonal?: boolean;
  isTeam?: boolean;
  inProgress?: boolean;
  hoverOffset?: HoverOffset;
  featured?: boolean;
  caseStudyRoute?: string;
}
