'use client';
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import ExpenseStats from './components/ExpenseStats';

export default function Home() {
  const [items, setItems] = useState([
    // { name: 'Coffee', price: 4.95 },
    // { name: 'Movie', price: 24.95 },
    // { name: 'candy', price: 7.95 },
  ]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [total, setTotal] = useState(0);

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.price !== '') {
      // setItems([...items, newItem]);
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        price: newItem.price,
        createdAt: serverTimestamp(),
      });
      setNewItem({ name: '', price: '' });
    }
  };

  // Read items from database
  useEffect(() => {
  const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      // Read total from itemsArr
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        setTotal(totalPrice);
      };
      calculateTotal();
      return () => unsubscribe();
    });
  }, []);

  // Delete items from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  return (
    <main>
      <div className='w-full items-center justify-between'>
        <h1 className='text-3xl sm:text-4xl font-semibold text-white tracking-tight text-center mb-4'>Expense Tracker</h1>
        <div className='bg-slate-800/60 border border-white/10 p-5 rounded-xl shadow-xl shadow-black/20 backdrop-blur'>
          <ExpenseStats items={items} />
          <form className='grid grid-cols-6 items-center text-black mt-4'>
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className='col-span-3 p-3 border border-slate-700 rounded-md text-white bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-400'
              type='text'
              placeholder='Enter Item'
            />
            <input
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              className='col-span-2 p-3 border border-slate-700 rounded-md mx-3 text-white bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-400'
              type='number'
              placeholder='Enter Rs'
            />
            <button
              onClick={addItem}
              className='text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 p-3 text-xl rounded-md shadow hover:shadow-emerald-600/20 transition'
              type='submit'
              aria-label='Add expense'
            >
              +
            </button>
          </form>
          <ul className='mt-4 divide-y divide-slate-700/60 rounded-md overflow-hidden border border-slate-700/60'>
            {items.map((item, id) => (
              <li
                key={id}
                className='w-full flex justify-between bg-slate-950/60'
              >
                <div className='p-4 w-full grid grid-cols-6 gap-2 items-center'>
                  <span className='col-span-4 capitalize text-slate-200'>{item.name}</span>
                  <span className='col-span-1 text-right text-slate-100'>${item.price}</span>
                  <span className='col-span-1 text-right text-slate-400 text-xs'>
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}
                  </span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className='p-4 border-l border-slate-800/80 hover:bg-slate-900/60 w-14 text-rose-400 hover:text-rose-300 transition'
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? (
            ''
          ) : (
            <div className='flex justify-between p-3 text-slate-300'>
              <span>Total</span>
              <span className='text-slate-100'>${total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}