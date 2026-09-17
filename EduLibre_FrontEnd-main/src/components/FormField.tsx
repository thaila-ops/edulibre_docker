import { useState } from 'react';

type Props = {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
};

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <label className="field">
      <span>{label}</span>

      <div className={isPassword ? 'field-input-with-action' : undefined}>
        <input
          aria-label={label}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />

        {isPassword ? (
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        ) : null}
      </div>
    </label>
  );
}

export default FormField;