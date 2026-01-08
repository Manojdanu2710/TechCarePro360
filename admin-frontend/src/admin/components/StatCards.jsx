const StatCards = ({ stats = [] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-lg shadow-black/20"
      >
        <p className="text-sm uppercase tracking-widest text-slate-400">{stat.label}</p>
        <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
        {stat.delta && (
          <p className={`mt-2 text-sm ${stat.delta > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {stat.delta > 0 ? '+' : ''}
            {stat.delta} vs last period
          </p>
        )}
      </div>
    ))}
  </div>
);

export default StatCards;

