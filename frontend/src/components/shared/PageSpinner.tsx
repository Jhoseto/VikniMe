export function PageSpinner() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
      role="status"
      aria-label="Зареждане..."
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-surface-200 border-t-navy-500 animate-spin" />
        <span className="text-sm text-surface-500 font-medium">Зареждане...</span>
      </div>
    </div>
  )
}
