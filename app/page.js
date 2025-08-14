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
  updateDoc,
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
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', price: '' });

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

  // Start editing an item
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ name: item.name || '', price: String(item.price ?? '') });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', price: '' });
  };

  // Save edits to Firestore
  const saveEdit = async (id) => {
    const name = (editValues.name || '').trim();
    const priceStr = String(editValues.price || '').trim();
    if (!name || priceStr === '' || Number.isNaN(parseFloat(priceStr))) return;
    await updateDoc(doc(db, 'items', id), { name, price: priceStr });
    cancelEdit();
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
            {items.map((item) => (
              <li
                key={item.id}
                className='w-full flex justify-between bg-slate-950/60'
              >
                <div className='p-4 w-full grid grid-cols-7 gap-2 items-center'>
                  {editingId === item.id ? (
                    <>
                      <input
                        className='col-span-4 p-2 rounded-md bg-slate-800/80 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/50'
                        value={editValues.name}
                        onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                        type='text'
                      />
                      <input
                        className='col-span-1 p-2 rounded-md bg-slate-800/80 text-white border border-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-400/50'
                        value={editValues.price}
                        onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                        type='number'
                        step='0.01'
                      />
                      <div className='col-span-2 flex justify-end gap-2'>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className='px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white'
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className='px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200'
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className='col-span-4 capitalize text-slate-200'>{item.name}</span>
                      <span className='col-span-1 text-right text-slate-100'>${item.price}</span>
                      <span className='col-span-1 text-right text-slate-400 text-xs'>
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}
                      </span>
                      <div className='col-span-1 flex justify-end gap-2'>
                        <button
                          onClick={() => startEdit(item)}
                          className='px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className='px-3 py-2 rounded-md bg-rose-700 hover:bg-rose-600 text-white'
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
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