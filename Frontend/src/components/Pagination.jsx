

function Pagination({ pageNo, setPageNo, totalPages }) {

    return (
        <div className="flex justify-center items-center space-x-4 mt-5 mb-5">
            {/* Previous Button */}
            <button
                onClick={() => pageNo > 1 && setPageNo(pageNo - 1)}
                disabled={pageNo === 1}
                className={`w-[70px] h-[30px] px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-all 
      ${pageNo === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"}`}
            >
                <i className="fa-solid fa-arrow-left"></i> Prev
            </button>

            {/* Page Number Display */}
            <div className="flex items-center space-x-2 text-md font-bold">
                <span className="text-blue-600">{pageNo}</span>
                <span className="text-gray-600">/</span>
                <span className="text-gray-600">{totalPages}</span>
            </div>

            {/* Next Button */}
            <button
                onClick={() => pageNo < totalPages && setPageNo(pageNo + 1)}
                disabled={pageNo === totalPages}
                className={`w-[70px] h-[30px] px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2 transition-all 
      ${pageNo === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"}`}
            >
                Next <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>

    )
}

export default Pagination;