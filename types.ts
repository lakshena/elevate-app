
export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
  bulletPoints: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
  description?: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    githubUsername: string;
    portfolioUrl: string;
    headline: string;
  };
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  certifications: string[];
  activities: string[];
  settings: {
    educationOrder: 'asc' | 'desc';
  };
}

export type TemplateId = 'classic' | 'modern' | 'minimal';
