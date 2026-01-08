const SearchBar = ({ value, onChange, placeholder = 'Search...', children }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
    />
    {children}
  </div>
);

export default SearchBar;

