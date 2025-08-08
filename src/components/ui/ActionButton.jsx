import React from 'react';
import Button from './Button';
import Icon from '../AppIcon';

const ActionButton = ({ 
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  success = false,
  iconName,
  iconPosition = 'left',
  children,
  onClick,
  className = "",
  ...props
}) => {
  // Determine button state and styling
  const getButtonVariant = () => {
    if (success) return 'success';
    if (loading) return 'outline';
    return variant;
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Icon name="Loader2" size={16} className="animate-spin" />
          <span>Processing...</span>
        </>
      );
    }

    if (success) {
      return (
        <>
          <Icon name="CheckCircle" size={16} />
          <span>Completed</span>
        </>
      );
    }

    return children;
  };

  const handleClick = (e) => {
    if (loading || disabled || success) return;
    onClick?.(e);
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      disabled={disabled || loading || success}
      onClick={handleClick}
      iconName={!loading && !success ? iconName : undefined}
      iconPosition={iconPosition}
      className={`transition-micro ${success ? 'cursor-default' : ''} ${className}`}
      {...props}
    >
      {getButtonContent()}
    </Button>
  );
};

// Specialized action buttons for common workflows
export const GenerateButton = ({ 
  onGenerate, 
  isGenerating = false, 
  isComplete = false,
  estimatedCount = 0,
  className = ""
}) => {
  const getButtonText = () => {
    if (isComplete) return 'Generation Complete';
    if (isGenerating) return 'Generating...';
    if (estimatedCount > 0) return `Generate ${estimatedCount?.toLocaleString()} Variations`;
    return 'Generate Email Variations';
  };

  return (
    <ActionButton
      variant="default"
      size="lg"
      loading={isGenerating}
      success={isComplete}
      iconName={isComplete ? 'CheckCircle' : 'Zap'}
      onClick={onGenerate}
      className={`w-full sm:w-auto ${className}`}
    >
      {getButtonText()}
    </ActionButton>
  );
};

export const DownloadButton = ({ 
  onDownload, 
  isDownloading = false, 
  format = 'CSV',
  count = 0,
  className = ""
}) => {
  return (
    <ActionButton
      variant="outline"
      size="default"
      loading={isDownloading}
      iconName="Download"
      onClick={onDownload}
      disabled={count === 0}
      className={className}
    >
      {isDownloading ? 'Preparing...' : `Download ${format} (${count?.toLocaleString()})`}
    </ActionButton>
  );
};

export const CopyButton = ({ 
  onCopy, 
  isCopying = false, 
  isCopied = false,
  count = 0,
  className = ""
}) => {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      loading={isCopying}
      success={isCopied}
      iconName={isCopied ? 'Check' : 'Copy'}
      onClick={onCopy}
      disabled={count === 0}
      className={className}
    >
      {isCopied ? 'Copied!' : 'Copy All'}
    </ActionButton>
  );
};

export const ClearButton = ({ 
  onClear, 
  isClearing = false,
  className = ""
}) => {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      loading={isClearing}
      iconName="Trash2"
      onClick={onClear}
      className={`text-error hover:text-error hover:bg-error/10 ${className}`}
    >
      {isClearing ? 'Clearing...' : 'Clear Results'}
    </ActionButton>
  );
};

export const RefreshButton = ({ 
  onRefresh, 
  isRefreshing = false,
  className = ""
}) => {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      loading={isRefreshing}
      iconName="RefreshCw"
      onClick={onRefresh}
      className={className}
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </ActionButton>
  );
};

export default ActionButton;