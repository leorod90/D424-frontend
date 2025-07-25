import { useEffect, useState } from 'react';
import api from '../api';
import type { AxiosError } from 'axios';
import jsPDF from 'jspdf';
import { SKILL_OPTIONS, ROLES_OPTIONS } from '../data/options.json';

interface Employee {
  id: number;
  name: string;
  role: string;
  created_at: string;
  skills: string[];
}

interface Props {
  token: string;
}

export default function Dashboard({ token }: Props) {
  // Existing states...
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'create' | 'search'>('edit');
  const [skillSearch, setSkillSearch] = useState<null | string>(null);

  // New states for create profile inputs
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('employee');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await api.get('/api/profiles');
    setEmployeeData(res.data);
    setShowModal(false);
  };

  const openSkillModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedSkills(employee.skills || []);
    setModalMode('edit');
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedEmployee(null);
    setSelectedSkills([]);
    setNewName('');
    setNewRole('employee');
    setModalMode('create');
    setShowModal(true);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const saveSkills = async () => {
    if (!selectedEmployee) return;
    await api.put(`/api/profiles/skills/${selectedEmployee.id}`, {
      skills: selectedSkills,
    });
    setShowModal(false);
    fetchEmployees();
  };

  const createProfile = async () => {
    if (!token) return;

    try {
      if (!newName.trim()) {
        alert('Name is required');
        return;
      }

      // Include token in Authorization header
      await api.post('/api/profiles', {
        name: newName,
        role: newRole,
        skills: selectedSkills,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setShowModal(false);
      fetchEmployees();
    } catch (e: unknown) {
      const error = e as AxiosError;
      console.log(error);
    }
  };

  const openSearchModal = () => {
    setModalMode('search');
    setShowModal(true);
  };

  const fetchEmployeeBySkill = async () => {
    if (skillSearch) {
      const res = await api.get('/api/profiles/search?skill=' + skillSearch);
      setSkillSearch(null)
      setEmployeeData(res.data);
      setShowModal(false);
    } else {
      fetchEmployees();
    }
  }

  const handleExport = async () => {
    try {
      // If no profiles passed as prop, fetch from API
      let dataToExport = employeeData;

      if (employeeData.length === 0) {
        const res = await api.get('/api/profiles');
        dataToExport = await res.data;
      }

      // Create PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      // @ts-expect-error non critical
      doc.setFont(undefined, 'bold');
      doc.text('Employee Profiles Report', 20, 20);

      // Date
      doc.setFontSize(10);
      // @ts-expect-error non critical
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      let yPosition = 50;

      dataToExport.forEach((profile, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Profile header
        doc.setFontSize(14);
        // @ts-expect-error non critical
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${profile.name}`, 20, yPosition);

        // Profile details
        doc.setFontSize(12);
        // @ts-expect-error non critical
        doc.setFont(undefined, 'normal');
        doc.text(`Role: ${profile.role}`, 25, yPosition + 10);

        const skillsText = `Skills: ${profile.skills.length > 0 ? profile.skills.join(', ') : 'No skills listed'}`;
        doc.text(skillsText, 25, yPosition + 20);

        yPosition += 35;
      });

      // Save the PDF
      doc.save(`employee-profiles-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add New Profile
        </button>
      </div>
      <div className="w-full bg-gray-200 flex justify-between p-4">
        <button
          className='bg-gray-500 text-white py-1 px-3 rounded-2xl text-sm cursor-pointer hover:bg-gray-600'
          onClick={openSearchModal}
        >
          Search
        </button>
        <button
          className='bg-blue-500 text-white py-1 px-3 rounded-2xl text-sm cursor-pointer hover:bg-blue-600'
          onClick={handleExport}
        >
          Export PDF
        </button>
      </div>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border border-gray-300 text-left">Name</th>
            <th className="px-4 py-2 border border-gray-300 text-left">Role</th>
            <th className="px-4 py-2 border border-gray-300 text-left">Skills</th>
            <th className="px-4 py-2 border border-gray-300 text-left">Date Joined</th>
            <th className="px-4 py-2 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employeeData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border border-gray-300">{item.name}</td>
              <td className="px-4 py-2 border border-gray-300">{item.role}</td>
              <td className="px-4 py-2 border border-gray-300">{(item.skills || []).join(', ')}</td>
              <td className="px-4 py-2 border border-gray-300">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <button
                  onClick={() => openSkillModal(item)}
                  className="text-blue-600 hover:underline"
                >
                  Edit Skills
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            {modalMode === 'edit' && (
              <>
                <h2 className="text-xl font-bold mb-4">Edit Skills</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SKILL_OPTIONS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSkills}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
            {modalMode === 'search' && (
              <>
                <h2 className="text-xl font-bold mb-4">Search by Skill</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SKILL_OPTIONS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skillSearch === skill}
                        onChange={() => setSkillSearch(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={fetchEmployeeBySkill}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </>
            )}
            {modalMode === 'create' && (
              <>
                <h2 className="text-xl font-bold mb-4">Create New Profile</h2>
                <label className="block mb-2">
                  Name:
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  />
                </label>
                <label className="block mb-2">
                  Role:
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  >
                    {ROLES_OPTIONS.map((role: string) => {
                      return (
                        <option key={role} value={role}>{role}</option>
                      )
                    })}
                  </select>
                </label>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProfile}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
