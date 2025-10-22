import type { Audience } from "@/components/ui/audience-picker";

/**
 * Calculates the total audience size based on selected audiences
 * - For saved audiences: uses projectedPersonasCount
 * - For Google Ad audiences: uses 250 × number of ad groups
 * - For Meta Ad audiences: uses 250 × number of ad groups
 */
export function calculateAudienceSize(audiences: Audience[]): number {
  return audiences.reduce((total, audience) => {
    switch (audience.source) {
      case "saved":
        // For saved audiences, we need to get projectedPersonasCount from the database
        // This will be handled by the component that has access to the full audience data
        return total + (audience.count || 0);
      case "google-ads":
        return total + (250 * (audience.count || 1));
      case "meta-ads":
        return total + (250 * (audience.count || 1));
      default:
        return total;
    }
  }, 0);
}

/**
 * Calculates audience size with access to full audience data including projectedPersonasCount
 */
export function calculateAudienceSizeWithProjectedCount(
  audiences: Array<Audience & { projectedPersonasCount?: number }>
): number {
  return audiences.reduce((total, audience) => {
    switch (audience.source) {
      case "saved":
        return total + (audience.projectedPersonasCount || 0);
      case "google-ads":
        return total + (250 * (audience.count || 1));
      case "meta-ads":
        return total + (250 * (audience.count || 1));
      default:
        return total;
    }
  }, 0);
}
