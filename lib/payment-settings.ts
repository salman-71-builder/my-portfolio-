/** Checkout payment settings (admin-configurable). Pure module. */

export interface PaymentSettings {
  minAdvancePct: number;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  rocketEnabled: boolean;
  bankEnabled: boolean;
  bkashNumber: string | null;
  nagadNumber: string | null;
  rocketNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
  bankRouting: string | null;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  minAdvancePct: 30,
  bkashEnabled: true,
  nagadEnabled: true,
  rocketEnabled: true,
  bankEnabled: true,
  bkashNumber: "01700-000000",
  nagadNumber: "01700-000000",
  rocketNumber: "01700-000000",
  bankName: "Example Bank Ltd.",
  bankAccountName: "ChinaCart",
  bankAccountNumber: "0000 0000 0000",
  bankBranch: "Gulshan, Dhaka",
  bankRouting: "000000000",
};

/** Checkout payment methods (used for the advance payment). */
export const CHECKOUT_METHODS = [
  {
    key: "bkash",
    label: "bKash",
    color: "#e2136e",
    automated: true,
    settingKey: "bkashNumber" as const,
  },
  {
    key: "nagad",
    label: "Nagad",
    color: "#f6921e",
    automated: true,
    settingKey: "nagadNumber" as const,
  },
  {
    key: "rocket",
    label: "Rocket",
    color: "#8c3494",
    automated: false,
    settingKey: "rocketNumber" as const,
  },
  {
    key: "bank",
    label: "Bank Transfer",
    color: "#1a2032",
    automated: false,
    settingKey: null,
  },
] as const;

export function enabledMethods(s: PaymentSettings) {
  return CHECKOUT_METHODS.filter((m) => {
    if (m.key === "bkash") return s.bkashEnabled;
    if (m.key === "nagad") return s.nagadEnabled;
    if (m.key === "rocket") return s.rocketEnabled;
    if (m.key === "bank") return s.bankEnabled;
    return false;
  });
}
