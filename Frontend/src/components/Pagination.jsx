function Pagination({ pageNo, setPageNo, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="my-10 flex justify-center items-center"
    >
      <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => pageNo > 1 && setPageNo(pageNo - 1)}
          disabled={pageNo <= 1}
          aria-label="Previous Page"
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold transition-all ${
            pageNo <= 1
              ? "cursor-not-allowed text-gray-300 bg-gray-50"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          }`}
        >
          <i className="fa-solid fa-chevron-left text-xs sm:text-sm" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Status Indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-blue-50/60 px-4 py-2.5 text-sm sm:text-base font-bold text-gray-700 border border-blue-100/60">
          <span className="text-gray-500 font-medium">Page</span>
          <span className="text-blue-600 font-black">{pageNo}</span>
          <span className="text-gray-400 font-normal">of</span>
          <span className="text-gray-800">{totalPages}</span>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => pageNo < totalPages && setPageNo(pageNo + 1)}
          disabled={pageNo >= totalPages}
          aria-label="Next Page"
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold transition-all ${
            pageNo >= totalPages
              ? "cursor-not-allowed text-gray-300 bg-gray-50"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <i className="fa-solid fa-chevron-right text-xs sm:text-sm" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;