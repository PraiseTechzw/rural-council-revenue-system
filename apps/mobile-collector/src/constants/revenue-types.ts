export const revenueSources = [
	{ label: "Shop Rentals", value: "shop_rentals" },
	{ label: "Housing Stands", value: "housing_stands" },
	{ label: "Mining Fees", value: "mining_fees" },
	{ label: "Market Levies", value: "market_levies" },
	{ label: "Other Council Charges", value: "other_council_charges" }
] as const;

export const paymentMethods = [
	{ label: "Cash", value: "cash" },
	{ label: "Mobile Money", value: "mobile_money" },
	{ label: "Bank Transfer", value: "bank_transfer" },
	{ label: "POS", value: "pos" }
] as const;
