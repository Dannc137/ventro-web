export type PaymentMethod = "TRANSFER" | "CASH" | "CARD" | "OTHER";

export type PaymentView = {
  id: string;
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  note: string | null;
  recordedByName: string | null;
};

export type ContributionView = {
  id: string;
  contributorId: string | null;
  contributorName: string;
  onApp: boolean;
  pledged: number;
  received: number;
  outstanding: number;
  settled: boolean;
  note: string | null;
  payments: PaymentView[];
};

export type FundingSummary = {
  paymentInstructions: string | null;
  totalPledged: number;
  totalReceived: number;
  gap: number;
  contributions: ContributionView[];
};

export type CreateContributionRequest = {
  contributorName?: string;
  contributorId?: string;
  pledged?: number;
  note?: string;
};

export type RecordPaymentRequest = {
  amount: number;
  paidOn?: string;
  method?: PaymentMethod;
  note?: string;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: "Bank transfer",
  CASH: "Cash",
  CARD: "Card",
  OTHER: "Other",
};