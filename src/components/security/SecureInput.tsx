
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/utils/secureValidation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  maxLength?: number;
  autoComplete?: string;
}

const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className,
  maxLength = 1000,
  autoComplete
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [sanitizedValue, setSanitizedValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Apply length limit
    const limitedValue = rawValue.substring(0, maxLength);
    
    // Sanitize input based on type
    let cleanValue = limitedValue;
    if (type !== 'password') {
      cleanValue = sanitizeInput(limitedValue);
    }
    
    setSanitizedValue(cleanValue);
    onChange(cleanValue);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <Input
        type={inputType}
        value={sanitizedValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete={autoComplete}
        maxLength={maxLength}
      />
      {type === 'password' && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default SecureInput;
