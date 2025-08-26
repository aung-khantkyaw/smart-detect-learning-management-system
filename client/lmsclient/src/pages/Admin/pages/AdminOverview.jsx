import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";

// Helpers
const monthKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const lastNMonthKeys = (n) => {
  const now = new Date();
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
};
const monthShort = (key) =>
  new Date(key + "-01").toLocaleDateString("en-US", { month: "short" });

// Generic Dual Bar Chart (two series per month)
function DualBarChart({
  title,
  data,
  seriesAKey,
  seriesBKey,
  seriesALabel,
  seriesBLabel,
  colorA,
  colorB,
}) {
  const width = 460;
  const height = 240;
  const innerH = height - 80; // top/bottom padding
  const barWidth = 24;
  const groupGap = 20;
  const leftPad = 40;
  const rightPad = 20;

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d[seriesAKey] || 0, d[seriesBKey] || 0))
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mb-3"
      >
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = height - 40 - (percent / 100) * innerH;
          return (
            <line
              key={percent}
              x1={leftPad}
              y1={y}
              x2={width - rightPad}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        {data.map((d, i) => {
          const baseX = leftPad + i * (2 * barWidth + groupGap);
          const aH = ((d[seriesAKey] || 0) / maxValue) * innerH;
          const bH = ((d[seriesBKey] || 0) / maxValue) * innerH;
          const aX = baseX;
          const bX = baseX + barWidth + 2;
          const aY = height - 40 - aH;
          const bY = height - 40 - bH;

          return (
            <g key={i}>
              <rect
                x={aX}
                y={aY}
                width={barWidth}
                height={aH}
                fill={colorA}
                rx="3"
                className="drop-shadow-sm"
              />
              <rect
                x={bX}
                y={bY}
                width={barWidth}
                height={bH}
                fill={colorB}
                rx="3"
                className="drop-shadow-sm"
              />
              {d[seriesAKey] > 0 && (
                <text
                  x={aX + barWidth / 2}
                  y={aY - 6}
                  textAnchor="middle"
                  className="fill-gray-700 text-[10px] font-semibold"
                >
                  {d[seriesAKey]}
                </text>
              )}
              {d[seriesBKey] > 0 && (
                <text
                  x={bX + barWidth / 2}
                  y={bY - 6}
                  textAnchor="middle"
                  className="fill-gray-700 text-[10px] font-semibold"
                >
                  {d[seriesBKey]}
                </text>
              )}
            </g>
          );
        })}

        {data.map((d, i) => {
          const baseX = leftPad + i * (2 * barWidth + groupGap) + barWidth;
          return (
            <text
              key={i}
              x={baseX}
              y={height - 12}
              textAnchor="middle"
              className="fill-gray-600 text-xs font-medium"
            >
              {d.month}
            </text>
          );
        })}
      </svg>

      <div className="flex justify-center gap-8">
        <div className="flex items-center">
          <span
            className="w-3.5 h-3.5 rounded mr-2"
            style={{ background: colorA }}
          ></span>
          <span className="text-sm font-semibold text-gray-700">
            {seriesALabel}
          </span>
        </div>
        <div className="flex items-center">
          <span
            className="w-3.5 h-3.5 rounded mr-2"
            style={{ background: colorB }}
          ></span>
          <span className="text-sm font-semibold text-gray-700">
            {seriesBLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// Wavy Line Chart (two series)
function WavyLineChart({
  title,
  data,
  seriesAKey,
  seriesBKey,
  seriesALabel,
  seriesBLabel,
  colorA,
  colorB,
}) {
  const width = 460;
  const height = 220;
  const leftPad = 30;
  const rightPad = 20;
  const topPad = 20;
  const bottomPad = 40;
  const innerW = width - leftPad - rightPad;
  const innerH = height - topPad - bottomPad;

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d[seriesAKey] || 0, d[seriesBKey] || 0))
  );

  const pointsFor = (key) => {
    const pts = data.map((d, i) => {
      const x = leftPad + (i / Math.max(1, data.length - 1)) * innerW;
      const y = topPad + innerH - ((d[key] || 0) / maxValue) * innerH;
      return `${x},${y}`;
    });
    return pts.join(" ");
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = topPad + innerH - (percent / 100) * innerH;
          return (
            <line
              key={percent}
              x1={leftPad}
              y1={y}
              x2={width - rightPad}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        <polyline
          points={pointsFor(seriesAKey)}
          fill="none"
          stroke={colorA}
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        <polyline
          points={pointsFor(seriesBKey)}
          fill="none"
          stroke={colorB}
          strokeWidth="3"
          className="drop-shadow-sm"
        />

        {["a", "b"].map((flag) =>
          data.map((d, i) => {
            const key = flag === "a" ? seriesAKey : seriesBKey;
            const color = flag === "a" ? colorA : colorB;
            const x = leftPad + (i / Math.max(1, data.length - 1)) * innerW;
            const y = topPad + innerH - ((d[key] || 0) / maxValue) * innerH;
            const val = d[key] || 0;
            return (
              <g key={`${flag}-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={color}
                  className="drop-shadow-sm"
                />
                {val > 0 && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    className="fill-gray-700 text-[10px] font-semibold"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })
        )}

        {data.map((d, i) => {
          const x = leftPad + (i / Math.max(1, data.length - 1)) * innerW;
          return (
            <text
              key={i}
              x={x}
              y={height - 12}
              textAnchor="middle"
              className="fill-gray-600 text-xs font-medium"
            >
              {d.month}
            </text>
          );
        })}
      </svg>

      <div className="flex justify-center gap-8 mt-2">
        <div className="flex items-center">
          <span
            className="w-3.5 h-3.5 rounded mr-2"
            style={{ background: colorA }}
          ></span>
          <span className="text-sm font-semibold text-gray-700">
            {seriesALabel}
          </span>
        </div>
        <div className="flex items-center">
          <span
            className="w-3.5 h-3.5 rounded mr-2"
            style={{ background: colorB }}
          ></span>
          <span className="text-sm font-semibold text-gray-700">
            {seriesBLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// Radar Chart (four metrics)
function RadarChart({ title, items }) {
  // items: [{ label, value, max }]
  const width = 260;
  const height = 260;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 90;
  const levels = 5;

  const pointFor = (index, value, max) => {
    const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
    const r = (value / Math.max(1, max)) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const polygonPoints = items
    .map((it, i) => pointFor(i, it.value, it.max).join(","))
    .join(" ");

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <svg width="100%" height="280" viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: levels }, (_, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={((i + 1) / levels) * radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}
        {items.map((_, i) => {
          const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="#3B82F6"
          strokeWidth="2"
        />

        {items.map((it, i) => {
          const [x, y] = pointFor(i, it.value, it.max);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#3B82F6"
              className="drop-shadow-sm"
            />
          );
        })}

        {items.map((it, i) => {
          const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + Math.cos(angle) * (radius + 18);
          const ly = cy + Math.sin(angle) * (radius + 18);
          return (
            <g key={i}>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-semibold"
              >
                {it.label}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                className="fill-gray-500 text-[11px]"
              >
                {it.value}/{it.max}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [majors, setMajors] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [chatRoomsAcademic, setChatRoomsAcademic] = useState([]);
  const [chatRoomsCourse, setChatRoomsCourse] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [u, d, p, y, m, qa, asg, acad, course] = await Promise.all([
          api.get("/users").catch(() => []),
          api.get("/departments").catch(() => []),
          api.get("/positions").catch(() => []),
          api.get("/academic-years").catch(() => []),
          api.get("/majors").catch(() => []),
          api.get("/quizzes").catch(() => []),
          api.get("/assignments").catch(() => []),
          api.get("/chat-rooms/academic").catch(() => []),
          api.get("/chat-rooms/course").catch(() => []),
        ]);

        if (!mounted) return;
        setUsers(Array.isArray(u) ? u : u?.data || []);
        setDepartments(Array.isArray(d) ? d : d?.data || []);
        setPositions(Array.isArray(p) ? p : p?.data || []);
        setAcademicYears(Array.isArray(y) ? y : y?.data || []);
        setMajors(Array.isArray(m) ? m : m?.data || []);
        setQuizList(Array.isArray(qa) ? qa : qa?.data || []);
        setAssignmentList(Array.isArray(asg) ? asg : asg?.data || []);
        setChatRoomsAcademic(Array.isArray(acad) ? acad : acad?.data || []);
        setChatRoomsCourse(Array.isArray(course) ? course : course?.data || []);
      } catch (err) {
        setError(err?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const months = useMemo(() => lastNMonthKeys(6), []);
  const monthLabels = months.map(monthShort);

  // Users dual bar (student vs teacher)
  const userBars = useMemo(() => {
    const map = Object.fromEntries(
      months.map((k) => [k, { students: 0, teachers: 0 }])
    );
    (users || []).forEach((u) => {
      if (!u?.createdAt) return;
      const d = new Date(u.createdAt);
      if (isNaN(d)) return;
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (!(key in map)) return;
      const role = String(u.role || "").toLowerCase();
      if (role === "student") map[key].students += 1;
      if (role === "teacher") map[key].teachers += 1;
    });
    return months.map((k, i) => ({
      month: monthLabels[i],
      students: map[k].students,
      teachers: map[k].teachers,
    }));
  }, [users, months, monthLabels]);

  // Chat rooms dual bar (academic vs course)
  const chatBars = useMemo(() => {
    const map = Object.fromEntries(
      months.map((k) => [k, { academic: 0, course: 0 }])
    );
    (chatRoomsAcademic || []).forEach((r) => {
      if (!r?.createdAt) return;
      const d = new Date(r.createdAt);
      if (isNaN(d)) return;
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in map) map[key].academic += 1;
    });
    (chatRoomsCourse || []).forEach((r) => {
      if (!r?.createdAt) return;
      const d = new Date(r.createdAt);
      if (isNaN(d)) return;
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in map) map[key].course += 1;
    });
    return months.map((k, i) => ({
      month: monthLabels[i],
      academic: map[k].academic,
      course: map[k].course,
    }));
  }, [chatRoomsAcademic, chatRoomsCourse, months, monthLabels]);

  // Wavy line: quizzes vs assignments counts per month (by createdAt)
  const qaLines = useMemo(() => {
    const base = Object.fromEntries(
      months.map((k) => [k, { quizzes: 0, assignments: 0 }])
    );
    (quizList || []).forEach((q) => {
      if (!q?.createdAt) return;
      const d = new Date(q.createdAt);
      if (isNaN(d)) return;
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in base) base[key].quizzes += 1;
    });
    (assignmentList || []).forEach((a) => {
      if (!a?.createdAt) return;
      const d = new Date(a.createdAt);
      if (isNaN(d)) return;
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in base) base[key].assignments += 1;
    });
    return months.map((k, i) => ({
      month: monthLabels[i],
      quizzes: base[k].quizzes,
      assignments: base[k].assignments,
    }));
  }, [quizList, assignmentList, months, monthLabels]);

  // Radar data
  const radarItems = useMemo(() => {
    const depts = departments?.length || 0;
    const poss = positions?.length || 0;
    const years = academicYears?.length || 0;
    const majs = majors?.length || 0;
    return [
      { label: "Departments", value: depts, max: Math.max(10, depts) },
      { label: "Positions", value: poss, max: Math.max(20, poss) },
      { label: "Academic Years", value: years, max: Math.max(10, years) },
      { label: "Majors", value: majs, max: Math.max(20, majs) },
    ];
  }, [departments, positions, academicYears, majors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg max-w-md">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <h2 className="text-xl font-bold text-red-800">
              Error Loading Dashboard
            </h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const totalStudents = users.filter(
    (u) => String(u.role || "").toLowerCase() === "student"
  ).length;
  const totalTeachers = users.filter(
    (u) => String(u.role || "").toLowerCase() === "teacher"
  ).length;
  const totalAdmins = users.filter(
    (u) => String(u.role || "").toLowerCase() === "admin"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DualBarChart
            title="User Registration by Month"
            data={userBars}
            seriesAKey="students"
            seriesBKey="teachers"
            seriesALabel="Students"
            seriesBLabel="Teachers"
            colorA="#3B82F6"
            colorB="#10B981"
          />

          <DualBarChart
            title="Chat Room Activity by Month"
            data={chatBars}
            seriesAKey="academic"
            seriesBKey="course"
            seriesALabel="Academic"
            seriesBLabel="Course"
            colorA="#8B5CF6"
            colorB="#EC4899"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WavyLineChart
            title="Quizzes and Assignments per Month"
            data={qaLines}
            seriesAKey="quizzes"
            seriesBKey="assignments"
            seriesALabel="Quizzes"
            seriesBLabel="Assignments"
            colorA="#0EA5E9"
            colorB="#F59E0B"
          />

          <RadarChart title="System Composition" items={radarItems} />
        </div>
      </div>
    </div>
  );
}
