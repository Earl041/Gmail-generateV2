import React from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const EmailInput = ({ 
  email, 
  onChange, 
  error, 
  isValid, 
  onValidate,
  className = "" 
}) => {
  const handleEmailChange = (e) => {
    const value = e?.target?.value;
    onChange(value);
    
    // Real-time validation
    if (onValidate) {
      onValidate(value);
    }
  };

  const getValidationIcon = () => {
    if (!email) return null;
    if (error) return <Icon name="AlertCircle" size={16} className="text-error" />;
    if (isValid) return <Icon name="CheckCircle" size={16} className="text-success" />;
    return null;
  };

  return (
    <div className={`email-input-container ${className}`}>
      <div className="relative">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email address (e.g., example@gmail.com)"
          value={email}
          onChange={handleEmailChange}
          error={error}
          required
          description="Enter any email address to generate alias variations"
          className="pr-10"
        />
        
        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute right-3 top-9 flex items-center">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {/* Email Format Help */}
      {!email && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-text-secondary">
              <p className="font-medium mb-1">Supported Email Formats:</p>
              <ul className="space-y-1 text-xs">
                <li>• Gmail: example@gmail.com</li>
                <li>• Yahoo: user@yahoo.com</li>
                <li>• Outlook: name@outlook.com</li>
                <li>• Custom domains: user@company.com</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInput;