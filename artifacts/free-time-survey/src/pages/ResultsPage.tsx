import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { supabase, type SurveyRow } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Bucket = { label: string; count: number };

function countBy(rows: SurveyRow[], key: keyof SurveyRow, normalize = false): Bucket[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = String(row[key]);
    const label = normalize ? raw.toLowerCase() : raw;
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

const HOURS_ORDER = [
  "1-2 hours",
  "2-4 hours",
  "4-6 hours",
  "8-10 hours",
  "more than 10 hours",
];

function aggregateResults(rows: SurveyRow[]) {
  const ageMap = new Map<number, number>();
  for (const row of rows) {
    ageMap.set(row.age, (ageMap.get(row.age) ?? 0) + 1);
  }
  const ageDistribution = Array.from(ageMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([age, count]) => ({ label: String(age), count }));

  const majorDistribution = countBy(rows, "major", true);

  const hoursMap = new Map<string, number>();
  for (const row of rows) {
    hoursMap.set(row.hours_per_week, (hoursMap.get(row.hours_per_week) ?? 0) + 1);
  }
  const hoursDistribution = Array.from(hoursMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || HOURS_ORDER.indexOf(a.label) - HOURS_ORDER.indexOf(b.label));

  const hobbyDistribution = countBy(rows, "free_time_hobbies", true);

  return { ageDistribution, majorDistribution, hoursDistribution, hobbyDistribution };
}

const CHART_COLOR = "#8A3BDB";

const CHART_TOOLTIP_STYLE = {
  borderRadius: "8px",
  border: "none",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

export default function ResultsPage() {
  const [rows, setRows] = useState<SurveyRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setIsError(false);

      const { data, error } = await supabase
        .from("survey_responses")
        .select("id, age, major, hours_per_week, free_time_hobbies, created_at");

      if (cancelled) return;

      if (error) {
        setIsError(true);
      } else {
        setRows(data as SurveyRow[]);
      }
      setIsLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const agg = rows && rows.length > 0 ? aggregateResults(rows) : null;

  return (
    <Layout>
      <div className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-results">
              Survey Results
            </h1>
            <p className="text-gray-500 mt-1">Aggregated data from all students</p>
          </div>
          <Button asChild variant="outline" size="sm" data-testid="button-home-header">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-8" data-testid="loading-skeleton" aria-label="Loading results">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-80 w-full rounded-xl" />
            </div>
          </div>
        ) : isError ? (
          <div
            className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 text-center"
            data-testid="error-state"
            role="alert"
          >
            <p className="font-semibold">Failed to load results.</p>
            <p className="text-sm mt-1">Make sure the database table has been created in Supabase, then try refreshing the page.</p>
          </div>
        ) : !rows || rows.length === 0 ? (
          <div
            className="bg-gray-50 border border-gray-100 p-12 rounded-xl text-center"
            data-testid="empty-state"
          >
            <p className="text-xl font-medium text-gray-700">No responses yet.</p>
            <p className="text-gray-500 mt-2 mb-6">Be the first to take the survey!</p>
            <Button asChild data-testid="button-take-survey-empty">
              <Link href="/survey">Take the Survey</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8" data-testid="results-content">

            {/* Total Responses */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Total Responses
              </h2>
              <p
                className="text-6xl font-bold"
                style={{ color: CHART_COLOR }}
                data-testid="stat-total-responses"
              >
                {rows.length}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Age Distribution */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Age Distribution</h3>
                <div className="h-64" role="img" aria-label="Age distribution bar chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agg!.ageDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip cursor={{ fill: "#f9fafb" }} contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hours per Week */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Hours of Free Time</h3>
                <div className="h-64" role="img" aria-label="Hours of free time bar chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={agg!.hoursDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#4b5563", fontSize: 12 }} width={110} />
                      <Tooltip cursor={{ fill: "#f9fafb" }} contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popular Majors */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Most Popular Majors</h3>
                <div className="h-64" role="img" aria-label="Most popular majors bar chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={agg!.majorDistribution.slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#4b5563", fontSize: 12 }} width={120} />
                      <Tooltip cursor={{ fill: "#f9fafb" }} contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popular Hobbies */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Most Popular Hobbies</h3>
                <div className="h-64" role="img" aria-label="Most popular hobbies bar chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={agg!.hobbyDistribution.slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#4b5563", fontSize: 12 }} width={120} />
                      <Tooltip cursor={{ fill: "#f9fafb" }} contentStyle={CHART_TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
