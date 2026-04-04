export const revenueSources = [
	{ label: "Shop Rentals", value: "shop_rental" },
	{ label: "Housing Stands", value: "housing_stand" },
	{ label: "Mining Fees", value: "mining_fee" },
	{ label: "Market Levies", value: "market_levy" },
	{ label: "Other Council Charges", value: "other" }
] as const;

export const paymentMethods = [
	{ label: "Cash", value: "cash" },
	{ label: "Mobile Money", value: "mobile_money" },
	{ label: "Bank Transfer", value: "bank" },
	{ label: "POS", value: "other" }
] as const;
