import React, { useState, useEffect, useContext } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts';
import { auth, db } from '../firebase';
import { ThemeContext } from '../context/ThemeContext';
import BudgetAlert from './BudgetAlert';
import ExpenseFilter from './ExpenseFilter';
import ExportCSV from './ExportCSV';
import './Dashboard.css';

const categories = [
  { name: 'Food', icon: '🍔' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Bills', icon: '💡' },
  { name: 'Entertainment', icon: '🎮' },
  { name: 'Others', icon: '📦' },
];

const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '8px',
        borderRadius: '5px'
      }}>
        <p><strong>{payload[0].name}</strong></p>
        <p>Spent: ₹{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [username, setUsername] = useState('');  // <-- username state here
  const { toggle } = useContext(ThemeContext);

  // Fetch username from Firestore
  useEffect(() => {
    const fetchUsername = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsername(docSnap.data().name || user.email);
      } else {
        setUsername(user.email); // fallback to email if no username found
      }
    };
    fetchUsername();
  }, [user.uid, user.email]);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setExpenses(data);
    });
    return () => unsub();
  }, [user.uid]);

  const addExpense = async () => {
    if (!amount || !description) {
      alert('Please fill in all fields');
      return;
    }

    await addDoc(collection(db, 'expenses'), {
      uid: user.uid,
      amount: parseFloat(amount),
      description,
      category,
      timestamp: new Date(),
    });

    setAmount('');
    setDescription('');
  };

  const deleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteDoc(doc(db, 'expenses', id));
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      (expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'All' || expense.category === filterCategory)
  );

  const categoryData = categories.map((cat) => ({
    name: cat.name,
    value: filteredExpenses
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="dashboard">
      <h1>TrackIt</h1>
      <h2>Welcome, {username}!</h2> {/* Show username here */}
      <button onClick={() => signOut(auth)}>Logout</button>
      <button onClick={toggle}>Toggle Dark/Light Mode</button>

      <BudgetAlert user={user} totalSpent={totalSpent} />

      <ExpenseFilter
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="form">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button onClick={addExpense}>Add Expense</button>
      </div>

      <div className="summary">
        <h2>Spending Summary</h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              isAnimationActive={true}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              <Label
                value={`Total: ₹${totalSpent}`}
                position="center"
                fontSize="16"
                fill="#333"
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="expense-list">
        {filteredExpenses.map((exp) => {
          const date = exp.timestamp ? new Date(exp.timestamp) : null;
          const formatted = date
            ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
            : 'No date';
          return (
            <div key={exp.id} className="expense-item">
              <p>
                {categories.find((c) => c.name === exp.category)?.icon}{' '}
                <strong>{exp.category}</strong>: ₹{exp.amount} - {exp.description}
                <br />
                <small>{formatted}</small>
              </p>
              <button onClick={() => deleteExpense(exp.id)}>Delete</button>
            </div>
          );
        })}
      </div>

      <div>
        <ExportCSV expenses={filteredExpenses} />
      </div>
    </div>
  );
};

export default Dashboard;
