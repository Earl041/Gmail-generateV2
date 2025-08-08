import React from 'react';
import Button from '../../../components/ui/Button';

import Icon from '../../../components/AppIcon';

const ContactSection = ({ className = "" }) => {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hai Earl, Saya dari Email generator");
    window.open(`https://wa.me/601173139757?text=${message}`, '_blank');
  };

  const handleDonation = () => {
    window.open('https://files.catbox.moe/doe5m5.jpg', '_blank');
  };

  return (
    <div className={`contact-section ${className}`}>
      <div className="space-y-6">
        {/* Support Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="Heart" size={20} className="text-error" />
            <h3 className="text-lg font-semibold text-text-primary">
              Support Our Work
            </h3>
          </div>
          
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            This email generator tool is provided free of charge. Your support helps us maintain and improve the service for everyone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Donation Button */}
          <Button
            variant="default"
            size="lg"
            iconName="Gift"
            iconPosition="left"
            onClick={handleDonation}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            Support with Donation
          </Button>

          {/* WhatsApp Contact Button */}
          <Button
            variant="outline"
            size="lg"
            iconName="MessageCircle"
            iconPosition="left"
            onClick={handleWhatsAppContact}
            className="w-full sm:w-auto border-success text-success hover:bg-success hover:text-success-foreground"
          >
            Contact via WhatsApp
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <Icon name="Shield" size={14} className="text-success" />
            <span>100% Local Processing • No Data Stored</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <Icon name="Zap" size={14} className="text-primary" />
            <span>Fast • Secure • Free to Use</span>
          </div>
        </div>

        {/* Developer Attribution */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-text-secondary">
            Developed with ❤️ by{' '}
            <span className="font-semibold text-primary">Earl Store</span>
          </p>
          <p className="text-xs text-text-secondary mt-1">
            © {new Date()?.getFullYear()} Gmail Generator. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;