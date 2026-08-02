import { cn } from '@/lib/utils';

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
