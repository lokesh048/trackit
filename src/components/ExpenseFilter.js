import React from 'react';

const ExpenseFilter = ({ filterCategory, setFilterCategory }) => {
  return (
    <div className="filters">
      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
        <option value="All">All Categories</option>
        <option value="Food">Food</option>
        <option value="Travel">Travel</option>
        <option value="Bills">Bills</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Others">Others</option>
      </select>
    </div>
  );
};

export default ExpenseFilter;
