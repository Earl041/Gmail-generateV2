import React from 'react';
import Icon from '../AppIcon';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="container-fluid">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon 
                name="Zap" 
                size={18} 
                color="white" 
                strokeWidth={2.5}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-text-primary leading-tight">
                Gmail Generator
              </h1>
              <p className="text-xs text-text-secondary leading-tight">
                By Earl Store
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {/* Trust Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
              <Icon name="Shield" size={14} />
              <span>Local Processing</span>
            </div>

            {/* Support Actions */}
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-micro rounded-lg hover:bg-muted/50"
                onClick={() => window.open('https://wa.me/your-number', '_blank')}
              >
                <Icon name="MessageCircle" size={16} />
                <span className="hidden sm:inline">Support</span>
              </button>
              
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-micro rounded-lg hover:bg-accent/10"
                onClick={() => {
                  // Handle donation action
                  console.log('Donation clicked');
                }}
              >
                <Icon name="Heart" size={16} />
                <span className="hidden sm:inline">Donate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;