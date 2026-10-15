import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Building,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react';

const TaskDetailView = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task?.title) {
      document.title = `${task.title} | Roots Media Marketing`;
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await api.getTaskById(id);
      setTask(res.data);
      if (res.data.slug && id !== res.data.slug) {
        navigate(`/tasks/${res.data.slug}`, { replace: true });
      }
    } catch (err) {
      showNotification(err.message, 'error');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.updateTaskStatus(task._id, newStatus);
      showNotification(`Task status updated to ${newStatus}`, 'success');
      setTask(res.data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task details..." />;
  }

  if (!task) return null;

  const employeeName =
    task.assignedEmployee?.fullName || task.employeeSnapshot?.fullName || 'Unassigned';

  const employeeEmail = task.assignedEmployee?.email || task.employeeSnapshot?.email || '';

  const employeeId = task.assignedEmployee?.employeeId || task.employeeSnapshot?.employeeId || '';

  const isLocked = task.status === 'Completed' || task.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        {!isLocked && (
          <Link
            to={`/tasks/${task.slug || task._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Task
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header Bar */}
        <div className="bg-[#1f2328] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#83282f] text-white">
                {task.taskId}
              </span>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} isOverdue={task.isOverdue} />
            </div>
            <h1 className="text-xl font-bold mt-2 text-gray-100">{task.title}</h1>
          </div>

          {/* Quick status transition actions */}
          <div className="flex items-center gap-2">
            {task.status === 'Todo' && (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('In Progress')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Start Progress
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('Cancelled')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Task
                </button>
              </>
            )}

            {task.status === 'In Progress' && (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('Completed')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Completed
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusTransition('Cancelled')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* Overdue alert if overdue */}
        {task.isOverdue && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            This task is OVERDUE! The due date ({new Date(task.dueDate).toLocaleDateString()}) has
            passed and the task has not been completed.
          </div>
        )}

        {/* Content details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Description
            </h2>
            <div className="p-4 bg-gray-50 rounded border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No detailed description provided.'}
            </div>
          </div>

          {/* Assigned Employee & Department Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded border border-gray-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                Assigned Employee
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {task.assignedEmployee ? (
                  <Link
                    to={`/employees/${task.assignedEmployee.slug || task.assignedEmployee._id}`}
                    className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    {employeeName}
                    <span className="text-xs text-gray-400 font-normal">({employeeId})</span>
                  </Link>
                ) : (
                  <span>
                    {employeeName}{' '}
                    <span className="text-xs text-gray-400 font-normal">
                      (Historical snapshot preserved)
                    </span>
                  </span>
                )}
              </div>
              {employeeEmail && <div className="text-xs text-gray-500 mt-1">{employeeEmail}</div>}
            </div>

            <div className="p-4 rounded border border-gray-200 bg-white">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-gray-400" />
                Department
              </div>
              <div className="text-sm font-semibold text-gray-900">{task.department}</div>
              <div className="text-xs text-gray-500 mt-1">
                Priority: <span className="font-semibold">{task.priority}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Dates Card */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Task Timeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded border border-gray-200 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Start Date</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {new Date(task.startDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Due Date</span>
                <span
                  className={`font-semibold text-sm ${
                    task.isOverdue ? 'text-rose-600 font-bold' : 'text-gray-900'
                  }`}
                >
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Created Date</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Completed Date</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {task.completedDate ? new Date(task.completedDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;
