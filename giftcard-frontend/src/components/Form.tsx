import React, { FormEvent, ChangeEvent, ReactNode } from "react";

interface FormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  title?: string;
  submitText?: string;
  isLoading?: boolean;
}

const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  title,
  submitText = "Submit",
  isLoading = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {title && (
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Fill out the form below to proceed
          </p>
        </div>
      )}
      {children}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full group relative px-6 py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-glow-lg hover:-translate-y-1 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isLoading ? (
          <span className="flex items-center justify-center gap-3 relative z-10">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitText}
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </span>
        )}
      </button>
    </form>
  );
};

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-900">
        {label}
        {required && <span className="text-accent-600 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-0 font-medium ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:bg-white"
            : "border-slate-200 bg-slate-50 focus:border-brand-500 focus:bg-white focus:shadow-lg focus:shadow-brand-100"
        }`}
      />
      {error && (
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export const SelectInput: React.FC<
  InputProps & { options: Array<{ value: string; label: string }> }
> = ({ label, name, value, onChange, error, required = false, options }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-900">
        {label}
        {required && <span className="text-accent-600 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange as any}
        required={required}
        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-0 font-medium appearance-none ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:bg-white"
            : "border-slate-200 bg-slate-50 focus:border-brand-500 focus:bg-white focus:shadow-lg focus:shadow-brand-100"
        }`}
      >
        <option value="">Select an option...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export const TextArea: React.FC<InputProps & { rows?: number }> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-slate-900">
        {label}
        {required && <span className="text-accent-600 ml-1">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all focus:outline-none focus:ring-0 font-medium resize-none ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-500 focus:bg-white"
            : "border-slate-200 bg-slate-50 focus:border-brand-500 focus:bg-white focus:shadow-lg focus:shadow-brand-100"
        }`}
      />
      {error && (
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Form;