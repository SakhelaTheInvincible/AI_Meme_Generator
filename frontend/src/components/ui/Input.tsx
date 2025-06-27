import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    return (
      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
              'hover:bg-white/20 focus:bg-white/20',
              icon ? 'pl-10' : '',
              error ? 'border-red-400 focus-visible:ring-red-400' : '',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0)
              props.onChange?.(e)
            }}
            {...props}
          />
          {label && (
            <motion.label
              className={cn(
                'absolute left-3 text-white/70 pointer-events-none transition-all duration-200',
                icon ? 'left-10' : '',
                focused || hasValue || props.value
                  ? 'top-0 text-xs bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent -translate-y-1/2 px-1'
                  : 'top-1/2 transform -translate-y-1/2 text-sm'
              )}
              initial={false}
              animate={{
                scale: focused || hasValue || props.value ? 0.85 : 1,
              }}
            >
              {label}
            </motion.label>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input } 