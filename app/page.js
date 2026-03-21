import { login } from './actions';
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-2 text-slate-800 text-center">WalletWise</h1>
        <p className="text-slate-500 text-center mb-8">Login to track your expenses</p>
        
        <form action={login} className="space-y-4">
          <input 
            name="username" 
            placeholder="Username" 
            required 
            className="w-full p-3 rounded-lg border border-slate-300 text-black outline-blue-500"
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            className="w-full p-3 rounded-lg border border-slate-300 text-black outline-blue-500"
          />
          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}