import React from 'react';

interface AdminPanelProps {
  user: any;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Admin Portal</h1>
        <p className="text-lg text-gray-700 mb-8">Welcome, <span className="font-bold text-blue-700">{user.username}</span>! You have full administrative access.</p>
        <div className="mb-8">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase">{user.email}</span>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
            onClick={onLogout}
          >
            Logout
          </button>
          <div className="mt-8 text-gray-500 text-sm">
            <p>More admin features coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
