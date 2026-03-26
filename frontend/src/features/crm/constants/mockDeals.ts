import type { DealStatus } from "../../common/types/ui";

export type MockDeal = {
  id: string;
  name: string;
  company: string;
  status: DealStatus;
  score: number;
  lastAction: string;
  daysInStage: number;
  value: string;
};

export const MOCK_DEALS: MockDeal[] = [
  { id: "1", name: "Sarah Chen", company: "CloudScale AI", status: "negotiation", score: 98, lastAction: "Sent proposal", daysInStage: 2, value: "$12,000" },
  { id: "2", name: "Priya Nambiar", company: "DataBridge Inc", status: "replied", score: 91, lastAction: "Follow-up sent", daysInStage: 4, value: "$8,500" },
  { id: "3", name: "Amara Osei", company: "Stackform", status: "contacted", score: 88, lastAction: "Initial outreach", daysInStage: 1, value: "$6,000" },
  { id: "4", name: "Marcus Thorne", company: "Velocity Ventures", status: "closed", score: 82, lastAction: "Contract signed", daysInStage: 0, value: "$15,000" },
  { id: "5", name: "Jameson Holt", company: "Nexus Group", status: "contacted", score: 76, lastAction: "Email opened", daysInStage: 3, value: "$4,200" },
];
