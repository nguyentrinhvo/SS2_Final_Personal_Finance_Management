export default function Input({ label, type = "text", placeholder, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 ${
            Icon ? "pl-10" : "px-4"
          } pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>
    </div>
  );
}