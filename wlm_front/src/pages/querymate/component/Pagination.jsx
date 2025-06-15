// 


//pagination 이전 다음
// import React from 'react';
// import '../css/pagination.css';

// const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
//   const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage)); // 최소 1

//   const handlePrev = () => {
//     if (currentPage > 1) onPageChange(currentPage - 1);
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) onPageChange(currentPage + 1);
//   };

//   return (
//     <div className="pagination">
//       <button onClick={handlePrev} disabled={currentPage === 1 || totalItems === 0}>
//         이전
//       </button>

//       {[...Array(totalPages)].map((_, idx) => (
//         <button
//           key={idx}
//           className={currentPage === idx + 1 ? 'active' : ''}
//           onClick={() => onPageChange(idx + 1)}
//           disabled={totalItems === 0}
//         >
//           {idx + 1}
//         </button>
//       ))}

//       <button onClick={handleNext} disabled={currentPage === totalPages || totalItems === 0}>
//         다음
//       </button>
//     </div>
//   );
// };

// export default Pagination;


import React from 'react';
import '../css/pagination.css';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="pagination">
      <button
        className="pageButton"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </button>

      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx}
          className={`pageButton ${currentPage === idx + 1 ? 'activePage' : ''}`}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}

      <button
        className="pageButton"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;

