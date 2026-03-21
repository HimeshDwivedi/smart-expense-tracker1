import clientPromise from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { addExpense, deleteExpense } from '../actions';
export const dynamic = 'force-dynamic';

export default async function Dashboard() { 
  const cookieStore = await cookies();    
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/');

  const client = await clientPromise;
  const rawExpenses = await client
    .db("expenseTracker")
    .collection("expenses")
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // ✅ Serialize MongoDB objects
  const expenses = rawExpenses.map(e => ({
    ...e,
    _id: e._id.toString(),
    createdAt: e.createdAt.toISOString(),
  }));

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ✅ Using serialized expenses + year check fix
  const monthlyTotal = expenses
    .filter(e => 
      new Date(e.createdAt).getMonth() === now.getMonth() &&
      new Date(e.createdAt).getFullYear() === now.getFullYear()
    )
    .reduce((acc, curr) => acc + curr.amount, 0);

  const weeklyTotal = expenses
    .filter(e => new Date(e.createdAt) >= oneWeekAgo)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-600 uppercase">Weekly</p>
            <p className="text-2xl font-bold">${weeklyTotal.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <p className="text-sm text-emerald-600 uppercase">Monthly</p>
            <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Expense */}
        <form action={addExpense} className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
          <input name="amount" type="number" step="0.01" placeholder="Amount" required className="flex-1 p-2 border rounded" />
          <select name="category" className="flex-1 p-2 border rounded">
            <option>Food 🍔</option>
            <option>Clothing 👕</option>
            <option>Travel ✈️</option>
            <option>Other 📦</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add</button>
        </form>

        {/* List with Delete Button */}
        <div className="space-y-3">
          {expenses.map((e) => (
            <div key={e._id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50">
              <div>
                <p className="font-bold">{e.category}</p>
                <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-red-500">-${e.amount.toFixed(2)}</span>
                
                {/* ✅ Fixed delete - using hidden input instead of closure */}
                <form action={deleteExpense}>
                  <input type="hidden" name="expenseId" value={e._id} />
                  <button className="text-slate-300 hover:text-red-600 text-sm">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}