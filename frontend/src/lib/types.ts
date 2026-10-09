export type JobType = "full_time" | "part_time" | "contract" | "intern";
export type Experience = "lt_1" | "1_3" | "4_5" | "6_10" | "gt_10";

export interface Company {
  name: string;
  sector: string;
  size: string;
}

export interface Vacancy {
  id: number;
  title: string;
  position: string;
  job_type: JobType;
  candidates_needed: number;
  active_until: string;
  location: string;
  is_remote: boolean;
  description: string;
  min_experience: Experience;
  show_salary: boolean;
  // Only present when the API exposes the salary (show_salary or owner).
  salary_min?: number | null;
  salary_max?: number | null;
  created_at: string;
  company: Company;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface User {
  id: number;
  name: string;
  email: string;
  company: Company;
}

export interface Options {
  positions: string[];
  locations: string[];
}

export type VacancyInput = Omit<Vacancy, "id" | "created_at" | "company">;
