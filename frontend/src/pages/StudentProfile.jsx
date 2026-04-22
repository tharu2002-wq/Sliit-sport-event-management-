import { useAuth } from "../context/AuthContext";

const StudentProfile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">My Profile</h2>
      
      <div className="rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
           <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-100 text-slate-400 border border-slate-200 shadow-sm shrink-0">
             <span className="text-4xl">👤</span>
           </div>
           <div>
             <h3 className="text-3xl font-bold text-slate-900">{user?.name}</h3>
             <p className="text-slate-500">{user?.email}</p>
             <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
               Student Member
             </span>
           </div>
        </div>
        
        <div className="grid gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
           <div>
             <h4 className="text-sm font-semibold text-slate-900">Personal Information</h4>
             <ul className="mt-3 space-y-2 text-sm text-slate-600">
               <li><span className="font-medium text-slate-800">Role:</span> {user?.role}</li>
               <li><span className="font-medium text-slate-800">Student ID:</span> {user?._id || "N/A"}</li>
             </ul>
           </div>
           
           <div>
             <h4 className="text-sm font-semibold text-slate-900">Account Actions</h4>
             <button 
               onClick={logout}
               className="mt-3 rounded-xl bg-coral px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600 block w-full md:w-auto text-center"
             >
               Sign Out
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
