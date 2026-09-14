import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, Circle, BookOpen, AlertCircle, Lock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const StudentSowTab = ({ studentId, activeSession, activeTerm, classId, subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (selectedSubject) {
      fetchSchemes();
    }
  }, [selectedSubject]);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const res = await api.get('/sow/student', {
        params: {
          class_id: classId,
          subject_id: selectedSubject,
          term: activeTerm,
          academic_session: activeSession
        }
      });
      setSchemes(res.data);
    } catch (err) {
      console.error('Error fetching scheme of work', err);
      if (err.response && err.response.status === 403) {
        setPermissionDenied(true);
      } else {
        setError('Failed to load scheme of work. Make sure data has been imported.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (permissionDenied) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Lock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Feature Locked</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          The School Administrator has disabled student access to the Scheme of Work progress tracker at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Syllabus Progress</h2>
          <p className="text-sm text-gray-500">See what topics have been covered in {activeTerm} - {activeSession}</p>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
        <select 
          className="w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map(s => (
            <option key={`subject-${s.id}`} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && !permissionDenied && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && selectedSubject && schemes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Syllabus Available</h3>
          <p className="text-gray-500 mt-1">The syllabus for this subject is not available yet.</p>
        </div>
      )}

      {!loading && !error && schemes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
            <span className="font-medium text-gray-700">Progress Overview</span>
            <span className="text-sm font-bold bg-purple-100 text-purple-800 py-1 px-3 rounded-full">
              {schemes.filter(s => s.progress?.status === 'completed').length} / {schemes.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {schemes.map((scheme) => {
              const isCompleted = scheme.progress?.status === 'completed';
              return (
                <div key={scheme.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="mb-3 md:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isCompleted ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        Week {scheme.week}
                      </span>
                      <h4 className={`font-semibold ${isCompleted ? 'text-green-900' : 'text-gray-800'}`}>{scheme.topic}</h4>
                    </div>
                    {scheme.sub_topic && <p className="text-sm text-gray-600 mt-1">{scheme.sub_topic}</p>}
                  </div>
                  
                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium bg-green-100 px-3 py-1.5 rounded-full">
                        <CheckCircle size={18} />
                        <span className="text-sm">Covered</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 font-medium px-3 py-1.5">
                        <Circle size={18} />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSowTab;
