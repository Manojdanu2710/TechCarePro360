const variants = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  assigned: 'bg-sky-500/15 text-sky-200 border-sky-500/40',
  completed: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  cancelled: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
  default: 'bg-slate-500/15 text-slate-200 border-slate-500/40'
};

const StatusBadge = ({ value }) => {
  const key = value?.toLowerCase();
  const styles = variants[key] ?? variants.default;

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles}`}>
      {value}
    </span>
  );
};

export default StatusBadge;

