'use client';

import type { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { useState } from 'react';
import { useTypedHint } from './useTypedHint';

type BaseFieldProps = {
  label: string;
  hint: string;
};

type NeonInputProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & {
  fieldType?: 'input';
};

type NeonSelectProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & {
  fieldType: 'select';
  options: Array<{ label: string; value: string }>;
};

type NeonFieldProps = NeonInputProps | NeonSelectProps;

export function NeonField(props: NeonFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(String(props.value ?? props.defaultValue ?? ''));
  const typedHint = useTypedHint(props.hint, isFocused && localValue.length === 0);
  const visibleHint = typedHint || (isFocused ? props.hint : '');

  if (props.fieldType === 'select') {
    const { label, hint: _hint, fieldType: _fieldType, options, onChange, onFocus, onBlur, ...selectProps } = props;

    return (
      <label className="account-field account-field--neon" data-active={isFocused ? 'true' : 'false'}>
        <span>{label}</span>
        <select
          {...selectProps}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onChange={(event) => {
            setLocalValue(event.target.value);
            onChange?.(event);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <em className="account-field__hint">{visibleHint}</em>
      </label>
    );
  }

  const { label, hint: _hint, fieldType: _fieldType, onChange, onFocus, onBlur, ...inputProps } = props;

  return (
    <label className="account-field account-field--neon" data-active={isFocused ? 'true' : 'false'}>
      <span>{label}</span>
      <input
        {...inputProps}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setLocalValue(event.target.value);
          onChange?.(event);
        }}
      />
      <em className="account-field__hint">{visibleHint}</em>
    </label>
  );
}
