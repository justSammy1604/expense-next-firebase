"use client";
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import dynamic from "next/dynamic";

// Lazy load chart.js + react-chartjs-2 only on client
const Charts = dynamic(
  async () => {
    const { Chart, registerables } = await import("chart.js");
    Chart.register(...registerables);
    const { Bar, Line } = await import("react-chartjs-2");
    return function Charts({ weekData, monthData, yearData }) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4">
            <h2 className="text-slate-200 mb-2">Weekly</h2>
            <Bar data={weekData.data} options={weekData.options} />
          </div>
          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4">
            <h2 className="text-slate-200 mb-2">Monthly</h2>
            <Line data={monthData.data} options={monthData.options} />
          </div>
          <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4">
            <h2 className="text-slate-200 mb-2">Yearly</h2>
            <Bar data={yearData.data} options={yearData.options} />
          </div>
        </div>
      );
    };
  },
  { ssr: false }
);

function groupBy(items, keyFn) {
  return items.reduce((acc, it) => {
    const k = keyFn(it);
    acc[k] = (acc[k] || 0) + (parseFloat(it.price) || 0);
    return acc;
  }, {});
}

export default function AnalyticsPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "items"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setItems(arr);
    });
    return () => unsub();
  }, []);

  const parseDate = (d) => {
    if (!d) return null;
    if (typeof d?.toDate === "function") return d.toDate();
    if (d instanceof Date) return d;
    if (typeof d === "number") return new Date(d);
    return null;
  };

  const charts = useMemo(() => {
    const withDates = items
      .map((it) => ({ ...it, date: parseDate(it.createdAt) }))
      .filter((it) => it.date);

    const fmtCurrency = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(n || 0);

    // Weekly chart: current ISO week by weekday
    const now = new Date();
    const startOfISOWeek = (date) => {
      const d = new Date(date);
      const day = (d.getDay() + 6) % 7; // Monday=0
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - day);
      return d;
    };
    const start = startOfISOWeek(now);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const weekItems = withDates.filter((i) => i.date >= start && i.date < end);
    const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekGroups = groupBy(weekItems, (i) => ((i.date.getDay() + 6) % 7));
    const weekData = {
      data: {
        labels: weekday,
        datasets: [
          {
            label: "This Week",
            data: weekday.map((_, idx) => weekGroups[idx] || 0),
            backgroundColor: "rgba(16, 185, 129, 0.6)",
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#cbd5e1" } }, tooltip: { callbacks: { label: (c) => fmtCurrency(c.raw) } } },
        scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" } } },
      },
    };

    // Monthly chart: last 30 days
    const mEnd = new Date();
    const mStart = new Date();
    mStart.setDate(mEnd.getDate() - 29);
    mStart.setHours(0, 0, 0, 0);
    const monthItems = withDates.filter((i) => i.date >= mStart && i.date <= mEnd);
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(mStart);
      d.setDate(mStart.getDate() + i);
      return d;
    });
    const monthGroups = groupBy(monthItems, (i) => i.date.toISOString().slice(0, 10));
    const monthData = {
      data: {
        labels: days.map((d) => d.toISOString().slice(5, 10)),
        datasets: [
          {
            label: "Last 30 Days",
            data: days.map((d) => monthGroups[d.toISOString().slice(0, 10)] || 0),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, .2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#cbd5e1" } }, tooltip: { callbacks: { label: (c) => fmtCurrency(c.raw) } } },
        scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" } } },
      },
    };

    // Yearly chart: current year by month
    const y = now.getFullYear();
    const yStart = new Date(y, 0, 1);
    const yEnd = new Date(y + 1, 0, 1);
    const yearItems = withDates.filter((i) => i.date >= yStart && i.date < yEnd);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const yearGroups = groupBy(yearItems, (i) => i.date.getMonth());
    const yearData = {
      data: {
        labels: months,
        datasets: [
          {
            label: `Year ${y}`,
            data: months.map((_, idx) => yearGroups[idx] || 0),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#cbd5e1" } }, tooltip: { callbacks: { label: (c) => fmtCurrency(c.raw) } } },
        scales: { x: { ticks: { color: "#94a3b8" } }, y: { ticks: { color: "#94a3b8" } } },
      },
    };

    return { weekData, monthData, yearData };
  }, [items]);

  return (
    <main>
      <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Analytics</h1>
      <p className="text-slate-300 mb-4">View your spending trends over time.</p>
      {/* @ts-ignore */}
      <Charts {...charts} />
    </main>
  );
}
