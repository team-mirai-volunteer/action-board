"use server";

import {
  fetchAchievementData as fetchAchievementDataService,
  fetchAllMetricsData as fetchAllMetricsDataService,
  fetchDonationData as fetchDonationDataService,
  fetchRegistrationData as fetchRegistrationDataService,
  fetchSupporterData as fetchSupporterDataService,
} from "../services/get-metrics";

export async function fetchSupporterData() {
  return fetchSupporterDataService();
}

export async function fetchDonationData() {
  return fetchDonationDataService();
}

export async function fetchAchievementData(startDate?: Date) {
  return fetchAchievementDataService(startDate);
}

export async function fetchRegistrationData() {
  return fetchRegistrationDataService();
}

export async function fetchAllMetricsData() {
  return fetchAllMetricsDataService();
}
