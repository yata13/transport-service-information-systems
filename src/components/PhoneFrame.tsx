import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
      <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-white relative">
        {children}
      </div>
    </div>
  );
};
