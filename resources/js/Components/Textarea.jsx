export default function Textarea({label, className, errors,...props}) {
    return (
        <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-stone-600'>
                {label}
            </label>
            <textarea
                className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 ${className}`}
                {...props}
            />
            {errors && (
                <small className='text-xs text-red-500'>{errors}</small>
            )}
        </div>
    )
}
