import React from 'react';
import Icon from '../AppIcon';

const SectionHeader = ({ 
  title, 
  subtitle, 
  icon, 
  progress, 
  isActive = false,
  className = "" 
}) => {
  return (
    <div className={`section-header ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-micro ${
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            <Icon name={icon} size={20} strokeWidth={2} />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className={`text-xl font-semibold transition-micro ${
              isActive ? 'text-text-primary' : 'text-text-secondary'
            }`}>
              {title}
            </h2>
            
            {/* Progress Indicator */}
            {progress !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Active Indicator Line */}
      {isActive && (
        <div className="mt-4 h-0.5 bg-gradient-to-r from-primary to-primary/20 rounded-full" />
      )}
    </div>
  );
};

export default SectionHeader;