import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex w-full min-h-screen text-foreground transition-colors duration-500 font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <main className="flex-grow flex flex-col p-4 md:p-8 items-center overflow-y-auto overflow-x-hidden">
                <div className="w-full max-w-7xl flex flex-col gap-10 animate-reveal">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
