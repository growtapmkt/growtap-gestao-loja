
import React from 'react';

interface LayoutBaseProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const LayoutBase: React.FC<LayoutBaseProps> = ({ children, onLogout }) => {
    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Placeholder for LayoutBase structure as it was before deletion */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutBase;
