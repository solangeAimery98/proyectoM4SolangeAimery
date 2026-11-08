import { Timestamp } from 'firebase/firestore';

export interface GardenProgress {
    growthPoints: number;
    totalWaterings: number;
    lastRewardTaskId: string | null;
    updatedAt: Timestamp | null;
}

export type GardenLevel = 1 | 2 | 3 | 4 | 5;

export type GardenStage =
    | 'sprout'
    | 'first-leaves'
    | 'growth'
    | 'flowering'
    | 'full-bloom';