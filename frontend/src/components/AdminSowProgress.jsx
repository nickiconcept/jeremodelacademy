import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AdminSowProgress = ({ activeSession }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeSession) {
      fetchProgress();
    }
  }, [activeSession]);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/sow/admin-overview', {
        params: { academic_session: activeSession }
      });
      setProgressData(res.data);
    } catch (err) {
      console.error('Error fetching admin progress', err);
      setError('Failed to load teacher progress overview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Teacher Syllabus Progress</h2>
            <p className="text-sm text-gray-500">Overview of Scheme of Work coverage across the school for {activeSession}</p>
          </div>
        </div>
        <button 
          onClick={fetchProgress}
          className="btn btn-secondary text-sm px-4 py-2"
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && progressData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
          <p className="text-gray-500 mt-1">Teachers have not marked any topics as treated for this session yet.</p>
        </div>
      )}

      {!loading && !error && progressData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-sm font-medium">
                <th className="p-4">Teacher Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Subject</th>
                <th className="p-4 text-center">Topics Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {progressData.map((row, idx) => (
                <tr key={`${row.teacher_id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {row.teacher_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{row.teacher_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{row.class_name}</td>
                  <td className="p-4 text-gray-600">{row.subject_name}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                      <CheckCircle size={14} />
                      {row.completed_topics} Topics
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSowProgress;
