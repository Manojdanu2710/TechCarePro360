const EmptyState = ({ title = 'Nothing here yet', description = 'Try changing your filters.' }) => (
  <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="mt-2 text-sm">{description}</p>
  </div>
);

export default EmptyState;

