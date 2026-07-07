export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/70 backdrop-blur-md border-b border-white/8">
      <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
        <a href="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Sazanami <span className="font-light opacity-80 text-blue-300">Blog</span>
        </a>
      </div>
    </header>
  );
}
