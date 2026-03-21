'use server'

import clientPromise from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';

async function getCollection(name) {
  const client = await clientPromise;
  return client.db("expenseTracker").collection(name);
}

export async function login(formData) {
  const username = formData.get('username');
  const password = formData.get('password');

  const users = await getCollection("users");
  let user = await users.findOne({ username });

  if (!user) {
    const result = await users.insertOne({ username, password });
    user = { _id: result.insertedId };
  } else if (user.password !== password) {
    throw new Error("Invalid password");
  }

  const cookieStore = await cookies(); 
  cookieStore.set('userId', user._id.toString(), { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 
  });

  redirect('/dashboard');
}

export async function addExpense(formData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/');

  const expenses = await getCollection("expenses");
  await expenses.insertOne({
    amount: parseFloat(formData.get('amount')),
    category: formData.get('category'),
    userId: userId,
    createdAt: new Date()
  });

  redirect('/dashboard');
}

// ✅ Fixed - now accepts formData instead of plain string
export async function deleteExpense(formData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/');

  const expenseId = formData.get('expenseId');
  const expenses = await getCollection("expenses");
  await expenses.deleteOne({ _id: new ObjectId(expenseId), userId }); // ✅ scoped to user
  redirect('/dashboard');
}