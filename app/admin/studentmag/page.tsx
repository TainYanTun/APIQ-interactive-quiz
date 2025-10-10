'use client';

import { useEffect, useState, useCallback } from 'react';

interface Student {
  id: number;
  student_id: string;
  name: string;
  department: string;
  image_url: string;
  is_active: number; // Added is_active property
}

interface Department {
  id: number;
  name: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ student_id: '', name: '', department_id: '' });
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('active'); // New state for filter

  const fetchStudents = useCallback(async () => {
    try {
      let url = '/api/students';
      if (filterStatus === 'active') {
        url += '?is_active=1';
      } else if (filterStatus === 'inactive') {
        url += '?is_active=0';
      } else if (filterStatus === 'all') {
        url += '?is_active=all'; // Backend will ignore this or handle it as 'all'
      }

      const res = await fetch(url);
      const responseData = await res.json();

      if (res.ok) {
        setStudents(responseData.data || []);
      } else {
        console.error('Error fetching students:', responseData);
        setStudents([]);
        alert(`Failed to fetch students: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network or parsing error fetching students:', error);
      setStudents([]);
      alert('Failed to fetch students due to a network error.');
    }
  }, [filterStatus]); // Re-fetch when filterStatus changes

  async function fetchDepartments() {
    const res = await fetch('/api/departments');
    const data = await res.json();
    setDepartments(data.data);
  }

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [fetchStudents]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        const res = await fetch('/api/students/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          fetchStudents();
        } else {
          const errorResponse = await res.json();
          console.error('Error deleting student:', errorResponse);
          let errorMessage = `Failed to delete student: ${errorResponse.message || 'Unknown error'}`;

          if (errorResponse.errors) {
            const fieldErrors = Object.values(errorResponse.errors).flat();
            if (fieldErrors.length > 0) {
              errorMessage += `\nDetails: ${fieldErrors.join(', ')}`;
            }
          }
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Network or parsing error deleting student:', error);
        alert('Failed to delete student due to a network error.');
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (confirm('Are you sure you want to activate this student?')) {
      try {
        const res = await fetch('/api/students/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          fetchStudents();
        } else {
          const errorResponse = await res.json();
          console.error('Error activating student:', errorResponse);
          let errorMessage = `Failed to activate student: ${errorResponse.message || 'Unknown error'}`;

          if (errorResponse.errors) {
            const fieldErrors = Object.values(errorResponse.errors).flat();
            if (fieldErrors.length > 0) {
              errorMessage += `\nDetails: ${fieldErrors.join(', ')}`;
            }
          }
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Network or parsing error activating student:', error);
        alert('Failed to activate student due to a network error.');
      }
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.department_id) {
      alert('Please select a department.');
      return;
    }

    const studentDataToSend = {
      ...newStudent,
      department_id: parseInt(newStudent.department_id, 10), // Convert to number
    };

    console.log('Adding student:', studentDataToSend);
    const res = await fetch('/api/students/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentDataToSend),
    });

    if (res.ok) {
      fetchStudents();
      setShowModal(false);
      setNewStudent({ student_id: '', name: '', department_id: '' });
    } else {
      const errorResponse = await res.json();
      console.error('Error adding student:', errorResponse);
      let errorMessage = `Failed to add student: ${errorResponse.message || 'Unknown error'}`;

      if (errorResponse.errors) {
        const fieldErrors = Object.values(errorResponse.errors).flat();
        if (fieldErrors.length > 0) {
          errorMessage += `\nDetails: ${fieldErrors.join(', ')}`;
        }
      }
      alert(errorMessage);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Manage student accounts and performance.</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Student Database</h2>
            {/* Filter for active/inactive students */}
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'active' | 'inactive' | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="active">Active Students</option>
              <option value="inactive">Inactive Students</option>
              <option value="all">All Students</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Create Student</button>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className={student.is_active === 0 ? 'bg-gray-50 text-gray-500' : ''}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {student.is_active === 1 ? (
                      <button onClick={() => handleDelete(student.id)} className="ml-4 text-red-600 hover:text-red-900">Deactivate</button>
                    ) : (
                      <button onClick={() => handleActivate(student.id)} className="ml-4 text-green-600 hover:text-green-900">Activate</button>
                    )}
                  </td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddStudent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Student</h3>
                  <div className="mt-2">
                    <input type="text" placeholder="Student ID" value={newStudent.student_id} onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                  <div className="mt-2">
                    <input type="text" placeholder="Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                  <div className="mt-2">
                    <select value={newStudent.department_id} onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">Add</button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
        </div>
      )}
    </div>
  );
}