export function Footer() {
  return (
    <footer className="border-t border-stone-200 py-6 mt-auto">
      <div className="max-w-3xl mx-auto px-4 text-center text-xs text-stone-500">
        <p>
          © {new Date().getFullYear()} Thơ Mộc — Nền tảng chia sẻ thơ ca mộc
          mạc.
        </p>
      </div>
    </footer>
  );
}
