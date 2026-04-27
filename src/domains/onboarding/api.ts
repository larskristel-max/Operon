import { ApiError, apiFetch } from "@/api/client";
import type { OnboardingProvisionPayload } from "@/domains/onboarding/types";

interface ProvisionRequest {
  first_name: string;
  last_name: string;
  brewery_name: string;
}

interface ProvisionResponse {
  ok?: boolean;
}

export async function provisionOnboarding(
  accessToken: string,
  payload: OnboardingProvisionPayload
): Promise<void> {
  try {
    await apiFetch<ProvisionResponse>("/api/onboarding/provision", {
      method: "POST",
      body: JSON.stringify({
        first_name: payload.firstName,
        last_name: payload.lastName ?? "",
        brewery_name: payload.breweryName,
      } satisfies ProvisionRequest),
    }, { accessToken });
  } catch (error) {
    if (error instanceof ApiError) {
      if (/^Request failed \(\d+\)$/.test(error.message) || error.message === "Unauthorized") {
        throw new Error("Failed to provision brewery workspace");
      }
      throw new Error(error.message);
    }
    throw error;
  }
}
