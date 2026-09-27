import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              Hotel Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome to the Hotel Management System
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
