import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex w-full min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <main className="flex-grow flex flex-col p-4 md:p-6 items-center overflow-y-auto">
                <div className="w-full max-w-7xl flex flex-col gap-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
