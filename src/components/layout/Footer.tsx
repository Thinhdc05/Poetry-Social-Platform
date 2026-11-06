export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800/80 py-8 mt-auto transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 text-center text-xs text-stone-500 dark:text-stone-400 font-serif space-y-1">
        <p className="italic">
          &ldquo;Ghé chơi một thoáng vần thơ, mang theo chút tĩnh lặng về nhà.&rdquo;
        </p>
        <p className="text-[11px] opacity-80">
          © {new Date().getFullYear()} Thơ Mộc — Nền tảng chia sẻ thơ ca tiếng Việt.
        </p>
      </div>
    </footer>
  )
}
