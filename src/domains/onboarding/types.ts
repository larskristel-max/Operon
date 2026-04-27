export interface OnboardingProvisionPayload {
  firstName: string;
  lastName?: string;
  breweryName: string;
}

export interface PendingOnboardingPayload extends OnboardingProvisionPayload {
  email: string;
  createdAt: string;
}

export type PendingOnboardingMap = Record<string, PendingOnboardingPayload>;
