"use client";
import React, { useMemo } from "react";

// items: Array<{ price: string|number, createdAt?: any }>
// Assumes price is numeric-like. createdAt is a Firestore Timestamp or Date or ms number.
export default function ExpenseStats({ items }) {
  const parseDate = (d) => {
    if (!d) return null;
    // Firestore Timestamp
    if (typeof d?.toDate === "function") return d.toDate();
    if (d instanceof Date) return d;
    if (typeof d === "number") return new Date(d);
    return null;
  };

  const now = new Date();
  const startOfISOWeek = (date) => {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7; // Monday=0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
  };
  const startOfMonth = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const startOfYear = (date) => {
    const d = new Date(date.getFullYear(), 0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const addMonths = (date, months) => {
    return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  };
  const addYears = (date, years) => {
    return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
  };

  const sum = (arr) => arr.reduce((acc, n) => acc + (parseFloat(n) || 0), 0);
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(n || 0);
  const diffPct = (curr, prev) => {
    if (!prev) return null;
    return ((curr - prev) / prev) * 100;
  };

  const computed = useMemo(() => {
    const withDates = items
      .map((it) => ({ ...it, priceNum: parseFloat(it.price) || 0, date: parseDate(it.createdAt) }))
      .filter((it) => !Number.isNaN(it.priceNum));

    // Define windows
    const thisWeekStart = startOfISOWeek(now);
    const lastWeekStart = addDays(thisWeekStart, -7);
    const lastWeekEnd = addDays(thisWeekStart, 0);

    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(addMonths(now, -1));
    const lastMonthEnd = thisMonthStart;

    const thisYearStart = startOfYear(now);
    const lastYearStart = startOfYear(addYears(now, -1));
    const lastYearEnd = thisYearStart;

    const inRange = (d, start, end) => d && d >= start && d < end;

    const thisWeek = withDates.filter((i) => inRange(i.date, thisWeekStart, addDays(thisWeekStart, 7)));
    const lastWeek = withDates.filter((i) => inRange(i.date, lastWeekStart, lastWeekEnd));

    const thisMonth = withDates.filter((i) => inRange(i.date, thisMonthStart, addMonths(thisMonthStart, 1)));
    const lastMonth = withDates.filter((i) => inRange(i.date, lastMonthStart, lastMonthEnd));

    const thisYear = withDates.filter((i) => inRange(i.date, thisYearStart, addYears(thisYearStart, 1)));
    const lastYear = withDates.filter((i) => inRange(i.date, lastYearStart, lastYearEnd));

    const totals = {
      week: sum(thisWeek.map((i) => i.priceNum)),
      lastWeek: sum(lastWeek.map((i) => i.priceNum)),
      month: sum(thisMonth.map((i) => i.priceNum)),
      lastMonth: sum(lastMonth.map((i) => i.priceNum)),
      year: sum(thisYear.map((i) => i.priceNum)),
      lastYear: sum(lastYear.map((i) => i.priceNum)),
    };

    return {
      totals,
      percents: {
        week: diffPct(totals.week, totals.lastWeek),
        month: diffPct(totals.month, totals.lastMonth),
        year: diffPct(totals.year, totals.lastYear),
      },
    };
  }, [items]);

  const Pct = ({ value }) => {
    if (value === null) return <span className="text-slate-400">N/A</span>;
    const up = value >= 0;
    const cls = up ? "text-emerald-400" : "text-rose-400";
    const arrow = up ? "▲" : "▼";
    return (
      <span className={cls}>
        {arrow} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-slate-300 text-sm">This Week</div>
        <div className="text-white text-2xl font-semibold">{fmt(computed.totals.week)}</div>
        <div className="text-slate-400 text-sm">vs last week <Pct value={computed.percents.week} /></div>
      </div>
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-slate-300 text-sm">This Month</div>
        <div className="text-white text-2xl font-semibold">{fmt(computed.totals.month)}</div>
        <div className="text-slate-400 text-sm">vs last month <Pct value={computed.percents.month} /></div>
      </div>
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="text-slate-300 text-sm">This Year</div>
        <div className="text-white text-2xl font-semibold">{fmt(computed.totals.year)}</div>
        <div className="text-slate-400 text-sm">vs last year <Pct value={computed.percents.year} /></div>
      </div>
    </div>
  );
}
