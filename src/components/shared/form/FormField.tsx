interface FormFieldProps {
  label?: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  description,
  htmlFor,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
