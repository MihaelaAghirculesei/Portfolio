export interface Projects {
    name: string;
    technologies: string [];
    previewImg: string;
    previewImgSrcset?: string;
    description?: string;
    githubUrl: string;
    liveUrl: string;
    isPersonal?: boolean;
    isTeam?: boolean;
    inProgress?: boolean;
}
