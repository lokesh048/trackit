import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const BudgetAlert = ({ user, totalSpent }) => {
  const [budget, setBudget] = useState('');
  const [savedBudget, setSavedBudget] = useState(0);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!user?.uid) return;

      const docRef = doc(db, 'budgets', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSavedBudget(data.amount || 0);
        setBudget(data.amount || '');
      }
    };
    fetchBudget();
  }, [user]);

  const handleSaveBudget = async () => {
    if (!user?.uid) return;

    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget)) {
      alert('Enter a valid budget amount');
      return;
    }

    await setDoc(doc(db, 'budgets', user.uid), {
      amount: numericBudget,
    });

    setSavedBudget(numericBudget);
    alert('Budget saved successfully!');
  };

  const remaining = savedBudget - totalSpent;

  return (
    <div className="budget-input">
      <h3>Set Your Monthly Budget</h3>
      <input
        type="number"
        placeholder="Enter total budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      <button onClick={handleSaveBudget}>Save Budget</button>

      {savedBudget > 0 && (
        <>
          <p><strong>Total Budget:</strong> ₹{savedBudget}</p>
          <p><strong>Total Spent:</strong> ₹{totalSpent}</p>
          <p>
            <strong>Remaining:</strong>{' '}
            <span style={{ color: remaining < 0 ? 'red' : 'green' }}>
              ₹{remaining}
            </span>
          </p>
          {remaining < 0 && (
            <p style={{ color: 'red' }}>
              ⚠️ You have exceeded your budget!
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetAlert;
