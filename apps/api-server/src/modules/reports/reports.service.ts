import { getDailyRevenue, getMonthlyRevenue, getRevenueByCollector, getRevenueBySource, getRevenueByWard } from "./reports.queries";

export async function dailyReport(filters: { date?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	return getDailyRevenue(filters);
}

export async function monthlyReport(filters: { month?: string; collectorId?: string; revenueSourceId?: string; wardId?: string }) {
	return getMonthlyRevenue(filters);
}

export async function revenueBySourceReport(filters: { startDate?: string; endDate?: string }) {
	return getRevenueBySource(filters);
}

export async function revenueByCollectorReport(filters: { startDate?: string; endDate?: string }) {
	return getRevenueByCollector(filters);
}

export async function revenueByWardReport(filters: { startDate?: string; endDate?: string }) {
	return getRevenueByWard(filters);
}
