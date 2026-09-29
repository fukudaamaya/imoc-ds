import React, { useId } from 'react';
import { Icon } from '../../icons/Icon';
import './TextField.css';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label, fixed top-left inside the field so it stays visible once a value is entered. */
  label: string;
  /** Supporting text under the field. Figma: Helper text. */
  helperText?: string;
  /** Validation message. Puts the field in its error state and replaces the helper text. Figma: State=Error + Validation error. */
  error?: string;
}

/** Single-line text input with a persistent label. */
export function TextField({ label, helperText, error, disabled, id, className, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? `tf-${autoId}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : helperText ? helperId : null, rest['aria-describedby']].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={['imoc-text-field', className].filter(Boolean).join(' ')}
      data-error={error ? true : undefined}
      data-disabled={disabled || undefined}
    >
      {/* The whole box is the label, so a click anywhere in it focuses the input. */}
      <label className="imoc-text-field__box" htmlFor={inputId}>
        <span className="imoc-text-field__label">{label}</span>
        <input
          {...rest}
          id={inputId}
          className="imoc-text-field__input"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </label>
      {error ? (
        <p className="imoc-text-field__error" id={errorId}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </p>
      ) : (
        helperText && (
          <p className="imoc-text-field__helper" id={helperId}>
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
