export interface Market {
  _id: string;
  name: string;
}

export interface MarketReport {
  _id: string;
  marketId: Market;
  createdAt: string;
  updatedAt: string; // ✅ required
  isSubmitted: boolean;
  submittedAt?: string;
  totalCCTV?: number;
  faultyCCTV?: number;
  walkthroughGates?: number;
  faultyWalkthroughGates?: number;
  metalDetectors?: number;
  faultyMetalDetectors?: number;
  biometricStatus?: boolean;
  comments?: string;
}

export interface WeeklyReport {
  _id: string;
  createdAt: string;
  marketsReport: MarketReport[]; // ✅ consistent
  clearedByIt: boolean;
  clearedByItAt: string | null;
  clearedByMonitoring: boolean;
  clearedByMonitoringAt: string | null;
  clearedByOperations: boolean;
  clearedByOperationsAt: string | null;
}
