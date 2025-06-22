export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  createdAt: Date | string;
  isActive: boolean;
  showResults: boolean;
}

export interface Vote {
  pollId: string;
  optionId: string;
  voterId: string;
  timestamp: Date;
} 