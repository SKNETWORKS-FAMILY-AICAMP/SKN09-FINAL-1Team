import React from 'react';
import '../css/pagination.css';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="pagination">
      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx}
          className={currentPage === idx + 1 ? 'active' : ''}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
