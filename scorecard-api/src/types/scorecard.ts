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
  date?: string;
  totalScore: number;
  notes?: string;
  scores?: HoleScore[];
}

export interface ScorecardFilter {
  playerName?: string;
  courseId?: string;
} 