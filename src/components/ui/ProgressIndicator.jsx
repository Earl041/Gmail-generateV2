import React from 'react';
import Icon from '../AppIcon';

const ProgressIndicator = ({ 
  progress = 0, 
  status = 'idle', // idle, processing, completed, error
  estimatedTime,
  currentStep,
  totalSteps,
  message,
  showPercentage = true,
  size = 'default', // sm, default, lg
  className = ""
}) => {
  const sizeClasses = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-3'
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Icon name="Loader2" size={16} className="animate-spin text-primary" />;
      case 'completed':
        return <Icon name="CheckCircle" size={16} className="text-success" />;
      case 'error':
        return <Icon name="AlertCircle" size={16} className="text-error" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-primary';
      case 'completed':
        return 'bg-success';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className={`progress-indicator ${className}`}>
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {message && (
            <span className="text-sm font-medium text-text-primary">
              {message}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          {/* Step Counter */}
          {currentStep && totalSteps && (
            <span>
              {currentStep} of {totalSteps}
            </span>
          )}
          
          {/* Percentage */}
          {showPercentage && (
            <span className="font-medium">
              {Math.round(progress)}%
            </span>
          )}
          
          {/* Estimated Time */}
          {estimatedTime && status === 'processing' && (
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {estimatedTime}
            </span>
          )}
        </div>
      </div>
      {/* Progress Bar */}
      <div className={`progress-bar ${sizeClasses?.[size]}`}>
        <div 
          className={`progress-fill ${getStatusColor()}`}
          style={{ 
            width: `${Math.max(0, Math.min(100, progress))}%`,
            transition: status === 'processing' ? 'width 0.3s ease-out' : 'width 0.5s ease-out'
          }}
        />
        
        {/* Shimmer Effect for Processing */}
        {status === 'processing' && (
          <div className="absolute inset-0 shimmer rounded-full opacity-30" />
        )}
      </div>
      {/* Processing Details */}
      {status === 'processing' && (
        <div className="mt-2 flex items-center justify-center">
          <div className="processing-indicator">
            <Icon name="Cpu" size={14} />
            <span>Processing with Web Workers</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;