export interface MarketReport {
  _id: string;
  marketId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isSubmitted: boolean;
  submittedAt?: string;
  updatedAt: string;
  biometricStatus?: boolean;
  faultyCCTV?: number;
  faultyMetalDetectors?: number;
  faultyWalkthroughGates?: number;
  totalCCTV?: number;
  walkthroughGates?: number;
  metalDetectors?: number;
  comments?: string;
}

export interface WeeklyReport {
  _id: string;
  createdAt: Date;
  marketsReport: MarketReport[];
  clearedByIt: boolean;
  clearedByItAt: Date;
  clearedByMonitoring: boolean;
  clearedByMonitoringAt: Date;
  clearedByOperations: boolean;
  clearedByOperationsAt: Date;
}
