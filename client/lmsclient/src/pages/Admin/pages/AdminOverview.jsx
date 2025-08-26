import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";

function StatCard({ title, value, subtitle, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-emerald-500 to-green-600",
    purple: "from-purple-500 to-fuchsia-600",
    orange: "from-orange-500 to-amber-600",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${colorMap[color]} text-white h-10 w-10`}
      >
        <span className="font-semibold">{String(title).charAt(0)}</span>
      </div>
      <div className="mt-4 text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}

function SimpleBarChart({ data = [], labels = [] }) {
  const max = Math.max(1, ...data);
  const height = 160;
  const width = 320;
  const barWidth = width / (data.length * 1.5 || 1);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      {data.map((v, i) => {
        const h = (v / max) * (height - 20);
        const x = 10 + i * (barWidth * 1.5);
        const y = height - h - 10;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx="4"
              className="fill-blue-500 opacity-80"
            />
            <text
              x={x + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              {labels[i] || i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SimpleLineChart({ data = [], labels = [] }) {
  const max = Math.max(1, ...data);
  const height = 160;
  const width = 320;
  const step = width / (data.length - 1 || 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <polyline
        points={points}
        fill="none"
        className="stroke-emerald-500"
        strokeWidth="3"
      />
      {data.map((v, i) => {
        const x = i * step;
        const y = height - (v / max) * (height - 20) - 10;
        return (
          <circle key={i} cx={x} cy={y} r="3" className="fill-emerald-500" />
        );
      })}
      {labels.map((lab, i) => (
        <text
          key={i}
          x={i * step}
          y={height - 2}
          textAnchor="middle"
          className="fill-gray-500 text-[10px]"
        >
          {lab}
        </text>
      ))}
    </svg>
  );
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get("/users").catch(() => []),
      api.get("/departments").catch(() => []),
      api.get("/courses").catch(() => []),
      api.get("/majors").catch(() => []),
      api.get("/academic-years").catch(() => []),
    ])
      .then(([u, d, c, m, y]) => {
        if (!mounted) return;
        setUsers(Array.isArray(u) ? u : u?.data || []);
        setDepartments(Array.isArray(d) ? d : d?.data || []);
        setCourses(Array.isArray(c) ? c : c?.data || []);
        setMajors(Array.isArray(m) ? m : m?.data || []);
        setYears(Array.isArray(y) ? y : y?.data || []);
      })
      .catch((e) => setError(e?.message || "Failed to load dashboard"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { title: "Users", value: users.length, color: "blue" },
      { title: "Departments", value: departments.length, color: "green" },
      { title: "Courses", value: courses.length, color: "purple" },
      { title: "Majors", value: majors.length, color: "orange" },
      { title: "Academic Years", value: years.length, color: "rose" },
    ],
    [users, departments, courses, majors, years]
  );

  // Build simple time-like series using createdAt months for line chart
  const monthLabels = [
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ];
  function countsByMonth(list) {
    const counts = new Array(12).fill(0);
    list.forEach((i) => {
      const d = i?.createdAt ? new Date(i.createdAt) : null;
      if (!isNaN(d)) counts[d.getMonth()] += 1;
    });
    return counts;
  }
  const usersByMonth = useMemo(() => countsByMonth(users), [users]);
  const coursesByMonth = useMemo(() => countsByMonth(courses), [courses]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Admin Overview
          </h1>
          <p className="text-gray-600">Key metrics across the system</p>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              color={s.color}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Users by Month
              </h3>
              <span className="text-xs text-gray-500">Line</span>
            </div>
            <div className="mt-3">
              <SimpleLineChart data={usersByMonth} labels={monthLabels} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Courses by Month
              </h3>
              <span className="text-xs text-gray-500">Bar</span>
            </div>
            <div className="mt-3">
              <SimpleBarChart data={coursesByMonth} labels={monthLabels} />
            </div>
          </div>
        </div>

        {/* Distribution bars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Counts Overview
            </h3>
            <div className="mt-4 space-y-3">
              {stats.map((s) => (
                <div key={s.title}>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{s.title}</span>
                    <span className="font-medium text-gray-900">{s.value}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        s.color === "blue"
                          ? "from-blue-500 to-indigo-600"
                          : s.color === "green"
                          ? "from-emerald-500 to-green-600"
                          : s.color === "purple"
                          ? "from-purple-500 to-fuchsia-600"
                          : s.color === "orange"
                          ? "from-orange-500 to-amber-600"
                          : "from-rose-500 to-pink-600"
                      }`}
                      style={{ width: `${Math.min(100, s.value * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Users
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.slice(0, 8).map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{u.fullName || "-"}</td>
                      <td className="px-4 py-2">{u.email || "-"}</td>
                      <td className="px-4 py-2">{u.role || "-"}</td>
                      <td className="px-4 py-2">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Tip</h3>
          <p className="mt-2 text-sm text-gray-600">
            For advanced charts (radar, stacked bar, pie), install chart
            libraries:
            <code className="ml-1 rounded bg-gray-100 px-1 py-0.5">
              npm i chart.js react-chartjs-2
            </code>
            , then we can upgrade these charts.
          </p>
        </div>
      </div>
    </div>
  );
}
