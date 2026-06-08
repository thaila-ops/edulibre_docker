type Props = {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
};

function FormField({ label, name, type = 'text', value, onChange, placeholder }: Props) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        aria-label={label}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default FormField;
