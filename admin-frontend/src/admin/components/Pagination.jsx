const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    onPageChange(nextPage);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
      <p>
        Page {page} of {totalPages} • Showing{' '}
        {Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(page - 1)}
          className="rounded-xl border border-slate-700 px-3 py-1 disabled:opacity-40"
          disabled={page === 1}
        >
          Prev
        </button>
        <button
          onClick={() => goTo(page + 1)}
          className="rounded-xl border border-slate-700 px-3 py-1 disabled:opacity-40"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

