import sazanamiLogo from '../assets/sazanami_dev.svg';

export function Header() {
  const logoSrc = typeof sazanamiLogo === 'string' ? sazanamiLogo : sazanamiLogo.src;

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-4">
      <header className="
          w-full max-w-7xl 
          bg-white/60 backdrop-blur-md 
          shadow-lg 
          rounded-full 
          px-6 py-3 
          flex items-center justify-between
          border border-gray-200
        ">
        <div className="container mx-auto flex justify-between items-center w-full">
          {/* 左側: ロゴ & タイトル */}
          <a href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src={logoSrc}
              alt="Sazanami Logo"
              width={120}
              height={40}
              loading="eager"
              className="w-[100px] md:w-[180px] h-auto md:p-1"
              style={{ height: 'auto' }}
            />
          </a>
        </div>
      </header>
    </div>
  );
}
