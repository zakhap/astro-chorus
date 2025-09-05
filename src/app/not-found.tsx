import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[rgb(222,212,198)] text-black font-mono flex items-center justify-center p-6 relative">
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-[rgb(222,212,198)] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-4">AstroChat</div>
          <div className="text-sm text-black/60">
            Optimized for Desktop,<br />
            temporarily
          </div>
        </div>
        {/* Credit */}
        <div className="absolute bottom-4 right-4 text-xs text-black/40">
          built by <a href="https://x.com/singsarg" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors">@singsarg</a>
        </div>
      </div>
      
      {/* Credit - Full Screen */}
      <div className="hidden lg:block absolute bottom-4 right-4 text-xs text-black/40 z-10">
        built by <a href="https://x.com/singsarg" target="_blank" rel="noopener noreferrer" className="hover:text-black/60 transition-colors">@singsarg</a>
      </div>
      
      <div className="w-[85%] max-w-3xl border-2 border-dashed border-black/40 p-12 bg-[rgb(222,212,198)]">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-2">AstroChat</h1>
          <p className="text-xs text-black/60">Chat with your planetary placements</p>
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          <div className="border-t border-black/20 pt-6">
            <div className="text-xs text-black/60 mb-4">System error encountered:</div>
            
            <div className="space-y-4">
              {/* Error Code */}
              <div className="pl-4">
                <div className="text-xs text-black block mb-2">
                  Error Code:
                </div>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <span className="text-black text-xs">404_PAGE_NOT_FOUND</span>
                </div>
              </div>

              {/* Status */}
              <div className="pl-4">
                <div className="text-xs text-black block mb-2">
                  Status:
                </div>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <span className="text-black text-xs">The requested celestial coordinates could not be located</span>
                </div>
              </div>

              {/* Coordinates */}
              <div className="pl-4">
                <div className="text-xs text-black block mb-2">
                  Lost coordinates:
                </div>
                <div className="flex items-center">
                  <span className="text-black mr-2">{'>'}</span>
                  <span className="text-black text-xs">[UNKNOWN°, UNDEFINED°]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Actions */}
          <div className="border-t border-black/20 pt-4">
            <div className="text-[10px] text-black/50">
              <div className="mb-2">Available navigation options:</div>
              <div className="pl-4 space-y-1">
                <div>• return to home base</div>
                <div>• recalibrate cosmic coordinates</div>
                <div>• consult with the planetary council</div>
                <div>• check astral positioning system</div>
              </div>
            </div>
          </div>

          {/* Return Button */}
          <div className="border-t border-black/20 pt-6">
            <Link
              href="/"
              className="w-full border border-black/40 text-black text-xs py-3 hover:bg-black hover:text-[rgb(222,212,198)] transition-colors block text-center"
            >
              Return to Base ←
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}