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

export interface AnalysisResult {
  candidateLevel: string;
  summary: string; // Tóm tắt hồ sơ
  matchScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  detailedAnalysis: DetailedAnalysis;
  suggestedJobs: Recommendation[];
  suggestedProjects: Recommendation[];
  suggestedCollaborators: Recommendation[]; // Types of people to work with
}

export interface UploadState {
  file: File | null;
  fileData: string | null; // Base64
  targetJob: string;
  mimeType: string;
}