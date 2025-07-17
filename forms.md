You’re running into a classic controlled-input conflict between semantic markup (like required) and custom validation flows (like Zod + error state).

✅ Problem Recap

You're using a React controlled input.

You want to show an asterisk when a field is required.

You also use Zod for validation, not HTML5 form validation.

If you add required, the browser will:

Show the asterisk (via some [required]::after CSS etc.)

Trigger its own native validation UI, which you don't want


If you remove required, you lose the asterisk, which is bad for usability.



---

✅ Solutions

✅ Option 1: Use a Custom Prop + CSS for Asterisk

Instead of relying on the required attribute for styling, add a custom isRequired prop and update your styles accordingly.

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  isRequired?: boolean
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, isRequired, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          {...props}
          aria-invalid={!!error}
          aria-required={isRequired}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

✅ Benefits:

You preserve semantic accessibility using aria-required.

You avoid native browser validation.

You control asterisk display explicitly via isRequired.



---

❌ Don't do this:

<input required /> // Triggers native HTML5 validation, which is intrusive if using zod


---

💡 Extra: Turn off HTML validation entirely

When using custom validation (Zod, RHF, etc.), always include:

<form noValidate onSubmit={...}>

This disables native validation globally, so required won't trigger browser tooltips—but the issue is, then your asterisk disappears unless you decouple visual from native required.


---

✅ Conclusion

Use a isRequired flag for visuals and ARIA, and keep required out of the DOM when you're not using native validation. It's the best compromise between user clarity, accessibility, and developer control.

