'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Course {
  id: string;
  course_code: string;
  title: string;
  department: string;
  description: string;
}

export default function SemesterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const semNumber = resolvedParams.id;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSemesterCourses() {
      try {
        const { coursesData, coursesError } = await supabase
            .from('semesters')
              .select(`id,name,courses (course_code,title,department)`)
  .eq('id', 1);

        if (coursesError) {
          console.error('Error fetching subjects:', coursesError.message);
          return;
        }

        setCourses(coursesData || []);
      } catch (err) {
        console.error('Unexpected error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSemesterCourses();
  }, [semNumber]);

  return (
    <div className="min-h-screen bg-[#0b141a] text-slate-100 p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link 
            href="/" 
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            &larr; Back to Home
          </Link>
          <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-500">
            IIITD OCW
          </span>
        </div>

        {/* Page Title Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-950/60 text-teal-400 border border-teal-800/50 mb-3">
            <span>Semester {semNumber} Subjects</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100">
            Available Subjects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse all core courses and subjects offered in Semester {semNumber}.
          </p>
        </div>

        {/* Subjects List View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/80" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center">
            <p className="text-slate-400 text-sm">No subjects available yet for Semester {semNumber}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="p-6 rounded-2xl bg-[#111b21]/80 border border-zinc-800/80 shadow-lg hover:border-teal-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-800/40">
                      {course.course_code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-400/40">
                      {course.department}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                    {course.title}
                  </h2>

                  {course.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-teal-400">
                  <span>View Course Details</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}