export interface DetailedAnalysis {
  experienceMatch: string;
  skillsAssessment: string;
  jobStability: string; // "Job Hopping" checks
  employmentGaps: string;
  progressionAndAwards: string;
  teamworkAndSoftSkills: string;
  proactivity: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface RoadmapItem {
  name: string;
  provider?: string; // Coursera, Udemy, Công ty A...
  durationOrType?: string; // 3 tháng, Full-time...
  description: string;
}

export interface DevelopmentRoadmap {
  courses: RoadmapItem[];
  projects: RoadmapItem[];
  jobs: RoadmapItem[];
}

export interface AnalysisResult {
  candidateLevel: string;
  summary: string; // Tóm tắt hồ sơ
  matchScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  detailedAnalysis: DetailedAnalysis;
  suggestedJobs: Recommendation[];
  suggestedProjects: Recommendation[];
  suggestedCollaborators: Recommendation[]; 
  developmentRoadmap: DevelopmentRoadmap; // New field
}

export interface UploadState {
  file: File | null;
  fileData: string | null; // Base64
  targetJob: string;
  mimeType: string;
}

export interface ActivityItem extends RoadmapItem {
  type: 'course' | 'project' | 'job';
  appliedDate: string;
  status: 'active' | 'pending' | 'completed';
}