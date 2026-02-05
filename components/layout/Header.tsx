import { EqualApproximately } from "lucide-react";
import React from "react";

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-20">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className=" px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-md">
            <EqualApproximately className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 m-0">
              Mate AI Chat
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
