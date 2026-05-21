// src/components/forms/FormField.tsx
'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

interface InputFieldProps
  extends BaseFieldProps,
    InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface TextareaFieldProps
  extends BaseFieldProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
}

type FormFieldProps = InputFieldProps | TextareaFieldProps

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(({ label, error, hint, required, as = 'input', className, ...props }, ref) => {
  const inputClass = clsx('field-input', error && 'error', className)

  return (
    <div className="flex flex-col gap-0">
      <label className="field-label">
        {label}
        {required && <span className="text-captain-gold ml-1">*</span>}
      </label>

      {hint && <p className="text-xs text-captain-anchor mb-1.5 -mt-0.5">{hint}</p>}

      {as === 'textarea' ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={inputClass}
          rows={3}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={inputClass}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p className="field-error" role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 9a.75.75 0 110 1.5A.75.75 0 016 9zm.75-4.5v3a.75.75 0 01-1.5 0v-3a.75.75 0 011.5 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'
