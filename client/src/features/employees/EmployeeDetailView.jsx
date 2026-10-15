import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Award,
  CheckCircle,
} from 'lucide-react';

const EmployeeDetailView = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    if (employee?.fullName) {
      document.title = `${employee.fullName} | Roots Media Marketing`;
    }
  }, [employee]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeById(id);
      setEmployee(res.data);
      if (res.data.slug && id !== res.data.slug) {
        navigate(`/employees/${res.data.slug}`, { replace: true });
      }
    } catch (err) {
      showNotification(err.message, 'error');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee profile..." />;
  }

  if (!employee) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Link>
        <Link
          to={`/employees/${employee.slug || employee._id}/edit`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit Profile
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#1f2328] to-[#2c323b] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{employee.fullName}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              {employee.role} • <span className="font-semibold">{employee.department}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase font-semibold">Active Tasks</div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {employee.activeTasksCount}{' '}
                <span className="text-xs text-gray-400 font-normal">/ 3 max</span>
              </div>
            </div>
            <StatusBadge status={employee.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-100 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Email</div>
              <div className="font-medium text-gray-900 mt-0.5">{employee.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Phone</div>
              <div className="font-medium text-gray-900 mt-0.5">{employee.phone}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Joining Date</div>
              <div className="font-medium text-gray-900 mt-0.5">
                {new Date(employee.joiningDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Leave status banner if On Leave */}
        {employee.status === 'On Leave' && employee.leaveStartDate && employee.leaveEndDate && (
          <div className="mx-6 my-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
            <span className="font-bold">On Leave Schedule: </span>
            {new Date(employee.leaveStartDate).toLocaleDateString()} —{' '}
            {new Date(employee.leaveEndDate).toLocaleDateString()}
            <p className="text-xs text-amber-700 mt-1">
              Task assignments starting within this leave period are blocked by backend business
              rules.
            </p>
          </div>
        )}

        {/* Skills */}
        <div className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-gray-400" />
            Skills & Competencies
          </div>
          <div className="flex flex-wrap gap-2">
            {employee.skills && employee.skills.length > 0 ? (
              employee.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No skills specified.</span>
            )}
          </div>
        </div>
      </div>

      {/* Task History Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-6 py-3.5 text-white font-semibold text-sm flex items-center justify-between">
          <span>Assigned Tasks ({employee.tasks ? employee.tasks.length : 0})</span>
          <Link
            to="/tasks/new"
            className="text-xs text-gray-300 hover:text-white underline font-normal"
          >
            Assign New Task
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5 text-left">Task ID</th>
                <th className="px-4 py-2.5 text-left">Title</th>
                <th className="px-4 py-2.5 text-left">Priority</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Due Date</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!employee.tasks || employee.tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No tasks currently assigned to this employee.
                  </td>
                </tr>
              ) : (
                employee.tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors h-11">
                    <td className="px-4 py-2 font-bold text-gray-800 whitespace-nowrap">
                      {task.taskId}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      <Link
                        to={`/tasks/${task.slug || task._id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Link
                        to={`/tasks/${task.slug || task._id}`}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailView;
