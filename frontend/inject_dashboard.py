import sys

def inject_teacher():
    with open('src/pages/TeacherDashboard.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'TimetableViewer' not in content:
        content = content.replace('import React', 'import TimetableViewer from \'../components/TimetableViewer\';\nimport React', 1)

    # Add state
    if 'const [timetables' not in content:
        content = content.replace('const [loading, setLoading]', 'const [timetables, setTimetables] = useState([]);\n  const [loading, setLoading]')

    # Update fetch
    if 'setTimetables(' not in content:
        idx = content.find('const loadAllData = async () => {')
        if idx != -1:
            try_idx = content.find('try {', idx)
            if try_idx != -1:
                content = content[:try_idx] + 'try {\n      const tRes = await api.getTimetables();\n      setTimetables(tRes.data || []);\n' + content[try_idx+5:]

    # Render component
    if 'activeSubTab === \'timetable\'' not in content:
        inject_str = """
      {activeSubTab === 'timetable' && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 border-0">
            <h5 className="mb-0 text-primary fw-bold">My Timetable</h5>
          </div>
          <div className="card-body">
            <TimetableViewer timetables={timetables} role="teacher" />
          </div>
        </div>
      )}
"""
        content = content.replace("{activeSubTab === 'overview' && (", inject_str + "{activeSubTab === 'overview' && (")

    with open('src/pages/TeacherDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Injected Teacher')

def inject_student():
    with open('src/pages/StudentDashboard.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import
    if 'TimetableViewer' not in content:
        content = content.replace('import React', 'import TimetableViewer from \'../components/TimetableViewer\';\nimport React', 1)

    # Add state
    if 'const [timetables' not in content:
        content = content.replace('const [loading, setLoading]', 'const [timetables, setTimetables] = useState([]);\n  const [loading, setLoading]')

    # Update fetch
    if 'setTimetables(' not in content:
        idx = content.find('const loadAllData = async () => {')
        if idx != -1:
            try_idx = content.find('try {', idx)
            if try_idx != -1:
                content = content[:try_idx] + 'try {\n      const tRes = await api.getTimetables();\n      setTimetables(tRes.data || []);\n' + content[try_idx+5:]

    # Render component
    if 'activeSubTab === \'timetable\'' not in content:
        inject_str = """
      {activeSubTab === 'timetable' && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 border-0">
            <h5 className="mb-0 text-primary fw-bold">Class Timetable</h5>
          </div>
          <div className="card-body">
            <TimetableViewer timetables={timetables} role="student" />
          </div>
        </div>
      )}
"""
        content = content.replace("{activeSubTab === 'overview' && (", inject_str + "{activeSubTab === 'overview' && (")

    with open('src/pages/StudentDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Injected Student')

inject_teacher()
inject_student()
