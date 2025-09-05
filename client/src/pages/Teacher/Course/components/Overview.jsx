import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../../../lib/api";

export default function TeacherOverview() {
  const { courseOffering } = useOutletContext();
  const [studentsCount, setStudentsCount] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      if (!courseOffering?.id) return;
      try {
        const enrollments = await api.get("/enrollments");
        const list = Array.isArray(enrollments)
          ? enrollments
          : enrollments?.data || [];
        const count = list.filter(
          (e) => e.offeringId === courseOffering.id
        ).length;
        if (isMounted) setStudentsCount(count);
      } catch (e) {
        console.error(e);
        if (isMounted) setStudentsCount(0);
      }
    };
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [courseOffering?.id]);

  useEffect(() => {
    let isMounted = true;
    const fetchMaterials = async () => {
      if (!courseOffering?.id) return;
      try {
        const materials = await api.get(
          `/materials/offering/${courseOffering.id}`
        );
        const list = Array.isArray(materials)
          ? materials
          : materials?.data || [];
        if (isMounted) setMaterialsCount(list.length || 0);
      } catch (e) {
        console.error(e);
        if (isMounted) setMaterialsCount(0);
      }
    };
    fetchMaterials();
    return () => {
      isMounted = false;
    };
  }, [courseOffering?.id]);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Course Description
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {courseOffering?.courseDescription?.trim() ||
              "No description available for this course."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {materialsCount}
              </div>
              <div className="text-xs text-blue-600">Materials</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {studentsCount}
              </div>
              <div className="text-xs text-green-600">Students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
