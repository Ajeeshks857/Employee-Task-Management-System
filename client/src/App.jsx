import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Notification from './components/common/Notification';

// Feature Views
import DashboardView from './features/dashboard/DashboardView';
import EmployeeListView from './features/employees/EmployeeListView';
import EmployeeFormView from './features/employees/EmployeeFormView';
import EmployeeDetailView from './features/employees/EmployeeDetailView';
import TaskListView from './features/tasks/TaskListView';
import TaskFormView from './features/tasks/TaskFormView';
import TaskDetailView from './features/tasks/TaskDetailView';

function App() {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  }, []);

  const closeNotification = () => setNotification(null);

  return (
    <BrowserRouter>
      <AppLayout>
        <Notification notification={notification} onClose={closeNotification} />

        <div className="pb-12">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<DashboardView showNotification={showNotification} />} />

            {/* Employee Routes */}
            <Route
              path="/employees"
              element={<EmployeeListView showNotification={showNotification} />}
            />
            <Route
              path="/employees/new"
              element={<EmployeeFormView showNotification={showNotification} />}
            />
            <Route
              path="/employees/:id"
              element={<EmployeeDetailView showNotification={showNotification} />}
            />
            <Route
              path="/employees/:id/edit"
              element={<EmployeeFormView showNotification={showNotification} />}
            />

            {/* Task Routes */}
            <Route path="/tasks" element={<TaskListView showNotification={showNotification} />} />
            <Route
              path="/tasks/new"
              element={<TaskFormView showNotification={showNotification} />}
            />
            <Route
              path="/tasks/:id"
              element={<TaskDetailView showNotification={showNotification} />}
            />
            <Route
              path="/tasks/:id/edit"
              element={<TaskFormView showNotification={showNotification} />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
