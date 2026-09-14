import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, Circle, BookOpen, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const TeacherSowTab = ({ activeSession, activeTerm, teacherClasses }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Group classes by class_id and subject_id based on teacher's assignments
  const uniqueClasses = Array.from(new Set(teacherClasses.map(c => c.class_id)))
    .map(id => teacherClasses.find(c => c.class_id === id));

  const availableSubjects = selectedClass 
    ? teacherClasses.filter(c => c.class_id === parseInt(selectedClass))
    : [];

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchSchemes();
    }
  }, [selectedClass, selectedSubject]);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/schemes', {
        params: {
          class_id: selectedClass,
          subject_id: selectedSubject,
          term: activeTerm,
          academic_session: activeSession
        }
      });
      setSchemes(res.data);
    } catch (err) {
      console.error('Error fetching scheme of work', err);
      setError('Failed to load scheme of work. Make sure data has been imported.');
    } finally {
      setLoading(false);
    }
  };

  const markTreated = async (schemeId) => {
    try {
      await api.post('/sow/mark-treated', {
        scheme_of_work_id: schemeId,
        class_id: selectedClass,
        academic_session: activeSession
      });
      // Update local state to reflect change immediately
      setSchemes(prev => prev.map(s => 
        s.id === schemeId 
          ? { ...s, progress: { status: 'completed', completed_at: new Date().toISOString() } } 
          : s
      ));
    } catch (err) {
      console.error('Error marking as treated', err);
      alert('Failed to mark topic as treated.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Scheme of Work Tracker</h2>
          <p className="text-sm text-gray-500">Track your syllabus progress for {activeTerm} - {activeSession}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject('');
              setSchemes([]);
            }}
          >
            <option value="">-- Choose Class --</option>
            {uniqueClasses.map(c => (
              <option key={`class-${c.class_id}`} value={c.class_id}>{c.class_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
          <select 
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">-- Choose Subject --</option>
            {availableSubjects.map(s => (
              <option key={`subject-${s.subject_id}`} value={s.subject_id}>{s.subject_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && selectedClass && selectedSubject && schemes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Scheme of Work Found</h3>
          <p className="text-gray-500 mt-1">The syllabus for this subject has not been populated yet.</p>
        </div>
      )}

      {!loading && !error && schemes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
            <span className="font-medium text-gray-700">Progress Overview</span>
            <span className="text-sm font-bold bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
              {schemes.filter(s => s.progress?.status === 'completed').length} / {schemes.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {schemes.map((scheme) => {
              const isCompleted = scheme.progress?.status === 'completed';
              return (
                <div key={scheme.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border transition-colors ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
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
                      <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                        <CheckCircle size={20} />
                        <span className="font-medium">Treated</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => markTreated(scheme.id)}
                        className="flex items-center gap-2 text-gray-600 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 px-4 py-2 rounded-lg transition-all"
                      >
                        <Circle size={20} />
                        <span className="font-medium">Mark as Treated</span>
                      </button>
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

export default TeacherSowTab;
