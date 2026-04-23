import React from 'react';

const StudentPlaceholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-4">
        🛠️
      </div>
      <h2 className="text-3xl font-bold text-slate-850">{title} Section</h2>
      <p className="text-slate-500 max-w-md">
        We are currently working on this feature to bring you the best experience for tracking {title.toLowerCase()}. Stay tuned!
      </p>
      <div className="flex gap-4 pt-6">
        <div className="h-2 w-24 bg-blue-100 rounded-full animate-pulse"></div>
        <div className="h-2 w-16 bg-blue-50 rounded-full animate-pulse delay-75"></div>
        <div className="h-2 w-20 bg-blue-100 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
};

export default StudentPlaceholder;
