export type Department = {
  _id: string;
  name: string;
};

export type Ticket = {
  images: string[];
  _id: string;
  title: string;
  description: string;
  department: string | Department;
  priority: "Low" | "Medium" | "High"; // adjust if other levels are possible
  status: "Open" | "In Progress" | "Resolved" | "Closed"; // adjust if needed
  createdBy: {
    _id: string;
    name: string;
    assignedTo: {
      _id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  estimatedResolutionTime?: string;
  resolvedAt?: string;
  closedAt?: string;
  comments: {
    comment: string;
    commentedBy: {
      _id: string;
      name: string;
    };
    _id: string;
    createdAt: string;
  }[];
  // __v: number;
};
