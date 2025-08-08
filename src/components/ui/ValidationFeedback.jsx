import React from 'react';
import Icon from '../AppIcon';

const ValidationFeedback = ({ 
  type = 'info',
  message,
  details,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className = ""
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-success/10 border-success/20 text-success-foreground',
          icon: 'CheckCircle',
          iconColor: 'text-success'
        };
      case 'warning':
        return {
          container: 'bg-warning/10 border-warning/20 text-warning-foreground',
          icon: 'AlertTriangle',
          iconColor: 'text-warning'
        };
      case 'error':
        return {
          container: 'bg-error/10 border-error/20 text-error-foreground',
          icon: 'AlertCircle',
          iconColor: 'text-error'
        };
      default:
        return {
          container: 'bg-primary/10 border-primary/20 text-primary-foreground',
          icon: 'Info',
          iconColor: 'text-primary'
        };
    }
  };

  const styles = getTypeStyles();

  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg transition-micro ${styles?.container} ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          <Icon 
            name={styles?.icon} 
            size={16} 
            className={styles?.iconColor}
            strokeWidth={2}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
        
        {details && (
          <div className="mt-2 text-xs opacity-80 leading-relaxed">
            {Array.isArray(details) ? (
              <ul className="space-y-1">
                {details?.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{details}</p>
            )}
          </div>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-micro"
          aria-label="Dismiss"
        >
          <Icon name="X" size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export const EmailValidation = ({ email, isValid, errors }) => {
  if (!email) return null;
  
  return (
    <ValidationFeedback
      type={isValid ? 'success' : 'error'}
      message={isValid ? 'Valid email format' : 'Invalid email format'}
      details={errors}
    />
  );
};

export const PerformanceWarning = ({ count, limit, estimatedTime }) => {
  if (count <= limit) return null;
  
  return (
    <ValidationFeedback
      type="warning"
      message={`High variation count detected (${count?.toLocaleString()})`}
      details={[
        `Processing may take ${estimatedTime || 'several seconds'}`,
        'Consider reducing variation options for faster results',
        'Web Workers will handle processing in background'
      ]}
    />
  );
};

export const ProcessingStatus = ({ status, message, progress }) => {
  const getStatusType = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'processing':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <ValidationFeedback
      type={getStatusType()}
      message={message}
      details={status === 'processing' && progress ? [`${Math.round(progress)}% complete`] : undefined}
    />
  );
};

export default ValidationFeedback;