const LoadingOverlay = ({ fullScreen = false, message = 'Loading...' }) => (
  <div
    className={`flex items-center justify-center ${
      fullScreen ? 'min-h-screen bg-slate-950' : 'py-10'
    }`}
  >
    <div className="flex flex-col items-center gap-3 text-slate-200">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  </div>
);

export default LoadingOverlay;

