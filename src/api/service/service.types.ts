export interface TaskResult {
  type: string;  // img, text
  url?: string;
  text?: string;
}

export interface TaskProcessingResult {
  success: boolean;
  message?: string;
  results?: TaskResult[];
}

export interface SystemInfo {
  savingsRate: number;
}
