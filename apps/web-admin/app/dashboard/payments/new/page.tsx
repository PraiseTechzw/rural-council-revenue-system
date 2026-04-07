"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createPayment } from "@/api/payments.api";
import { listCollectors } from "@/api/collectors.api";
import { listRevenueSources } from "@/api/revenueSources.api";
import { listWards } from "@/api/wards.api";
import { useAuth } from "@/components/providers/auth-provider";

const paymentMethods = [
	{ label: "Cash", value: "cash" },
	{ label: "Mobile Money", value: "mobile_money" },
	{ label: "Bank", value: "bank" },
	{ label: "Other", value: "other" }
] as const;

export default function NewPaymentPage() {
	const router = useRouter();
	const { user } = useAuth();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [payerName, setPayerName] = useState("");
	const [amount, setAmount] = useState("");
	const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [notes, setNotes] = useState("");
	const [collectorId, setCollectorId] = useState("");
	const [wardId, setWardId] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["value"]>("cash");
	const [revenueSourceId, setRevenueSourceId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const collectorsQuery = useQuery({
		queryKey: ["collectors", "payment-form"],
		queryFn: () => listCollectors({ page: 1, limit: 100, status: "active" })
	});

	const revenueSourcesQuery = useQuery({
		queryKey: ["revenue-sources", "payment-form"],
		queryFn: () => listRevenueSources({ page: 1, limit: 100, isActive: "true" })
	});

	const wardsQuery = useQuery({
		queryKey: ["wards", "payment-form"],
		queryFn: () => listWards({ page: 1, limit: 100 })
	});

	const collectorOptions = useMemo(() => collectorsQuery.data?.rows ?? [], [collectorsQuery.data?.rows]);
	const revenueSourceOptions = useMemo(() => revenueSourcesQuery.data?.rows ?? [], [revenueSourcesQuery.data?.rows]);
	const wardOptions = useMemo(() => wardsQuery.data?.rows ?? [], [wardsQuery.data?.rows]);

	const mutation = useMutation({
		mutationFn: createPayment,
		onSuccess: (payment) => {
			router.push(`/dashboard/payments?selected=${payment.id}`);
		}
	});

	const canSubmit = payerName.trim().length > 1 && amount && revenueSourceId && collectorId && paymentDate;

	return (
		<section className="dashboard-page reveal">
			<header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="dashboard-title">Collect Payment</h1>
					<p className="dashboard-subtitle">Create a payment from the finance desk or on behalf of a collector.</p>
				</div>
				<button type="button" className="premium-button-outline" onClick={() => router.push("/dashboard/payments")}>Back to Ledger</button>
			</header>

			<div className="grid gap-4 xl:grid-cols-[1.4fr,0.9fr]">
				<div className="premium-panel p-4 md:p-6">
					<form
						className="grid gap-4"
						onSubmit={async (event) => {
							event.preventDefault();
							setSubmitError(null);
							setIsSubmitting(true);
							try {
								await mutation.mutateAsync({
									payerName: payerName.trim(),
									revenueSourceId,
									amount: Number(amount),
									paymentMethod,
									paymentDate,
									notes: notes.trim() || undefined,
									collectorId,
									wardId: wardId || null,
									offlineReferenceId: `WEB-${Date.now()}`
								});
							} catch (error) {
								setSubmitError(error instanceof Error ? error.message : "Failed to create payment");
							} finally {
								setIsSubmitting(false);
							}
						}}
					>
						<div className="grid gap-4 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Payer name</span>
								<input className="premium-input" value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="Enter payer full name" />
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Amount</span>
								<input className="premium-input" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" />
							</label>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Revenue source</span>
								<select className="premium-input" value={revenueSourceId} onChange={(event) => setRevenueSourceId(event.target.value)}>
									<option value="">Select revenue source</option>
									{revenueSourceOptions.map((source) => (
										<option key={source.id} value={source.id}>
											{source.name} ({source.code})
										</option>
									))}
								</select>
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Collector</span>
								<select className="premium-input" value={collectorId} onChange={(event) => setCollectorId(event.target.value)}>
									<option value="">Select collector</option>
									{collectorOptions.map((collector) => (
										<option key={collector.id} value={collector.id}>
											{collector.userFirstName} {collector.userLastName} {collector.wardName ? `- ${collector.wardName}` : ""}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Payment method</span>
								<select className="premium-input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}>
									{paymentMethods.map((method) => (
										<option key={method.value} value={method.value}>
											{method.label}
										</option>
									))}
								</select>
							</label>
							<label className="grid gap-2">
								<span className="text-sm font-semibold text-slate-700">Payment date</span>
								<input className="premium-input" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
							</label>
						</div>

						<label className="grid gap-2">
							<span className="text-sm font-semibold text-slate-700">Ward</span>
							<select className="premium-input" value={wardId} onChange={(event) => setWardId(event.target.value)}>
								<option value="">Use collector ward</option>
								{wardOptions.map((ward) => (
									<option key={ward.id} value={ward.id}>
										{ward.name} ({ward.code})
									</option>
								))}
							</select>
						</label>

						<label className="grid gap-2">
							<span className="text-sm font-semibold text-slate-700">Notes</span>
							<textarea className="premium-input min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" />
						</label>

						{submitError ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{submitError}</p> : null}

						<button type="submit" disabled={!canSubmit || isSubmitting} className="premium-button w-full md:w-auto">
							{isSubmitting ? "Saving payment..." : "Create Payment"}
						</button>
					</form>
				</div>

				<div className="premium-panel-strong p-4 md:p-6">
					<h2 className="text-base font-semibold text-emerald-50">Quick tips</h2>
					<ul className="mt-3 space-y-3 text-sm text-emerald-100/85">
						<li>Use the collector dropdown for finance entries or choose your own record when collecting in the field.</li>
						<li>Payer name is enough; the backend will create the payer if it does not already exist.</li>
						<li>Leave ward blank to use the selected collector ward.</li>
						<li>Payment date must be in YYYY-MM-DD format.</li>
					</ul>
					<p className="mt-6 text-xs text-emerald-100/60">
						Signed in as {user ? `${user.firstName} ${user.lastName}` : "Unknown user"}
					</p>
				</div>
			</div>
		</section>
	);
}
