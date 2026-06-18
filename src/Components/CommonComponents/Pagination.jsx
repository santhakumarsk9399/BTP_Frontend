// import React from "react";
// import "../../Styles/Pagination.css";

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   const getPageNumbers = () => {
//     const pages = [];
//     if (totalPages <= 5) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
//       else if (currentPage >= totalPages - 2)
//         pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
//     }
//     return pages;
//   };

//   return (
//     <div className="pagination-container">
//       <button
//         className="pagination-btn"
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         Prev
//       </button>

//       {getPageNumbers().map((page, index) =>
//         page === "..." ? (
//           <span key={index} className="pagination-ellipsis">...</span>
//         ) : (
//           <button
//             key={index}
//             className={`pagination-btn ${currentPage === page ? "active" : ""}`}
//             onClick={() => onPageChange(page)}
//           >
//             {page}
//           </button>
//         )
//       )}

//       <button
//         className="pagination-btn"
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default Pagination;

import React from "react";
import "../../Styles/Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
      else if (currentPage >= totalPages - 2)
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      {/* Left side — items per page selector */}
      <div className="pagination-info">
        <span>Showing&nbsp;</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="pagination-select"
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span>&nbsp;of {totalItems} Entries</span>
      </div>

      {/* Right side — navigation */}
      <div className="pagination-container">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={index}
              className={`pagination-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
