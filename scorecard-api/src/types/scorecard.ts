export interface HoleScore {
  id?: string;
  scorecardId?: string;
  holeNumber: number;
  score: number;
  putts?: number;
  fairwayHit?: boolean;
}

export interface Scorecard {
  id?: string;
  playerName: string;
  courseId: string;
  date?: Date;
  totalScore: number;
  notes?: string;
  scores?: HoleScore[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScorecardFilter {
  playerName?: string;
  courseId?: string;
} 