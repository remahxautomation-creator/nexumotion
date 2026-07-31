import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-white mb-3">AutoParts MENA</h3>
          <p className="text-slate-400">
            Genuine industrial automation parts for Egypt, the Middle East, and Africa.
            50+ brands. 5,000+ SKUs. Engineer-first service.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Shop</h4>
          <ul className="space-y-2">
            <li><Link href="/brands" className="hover:text-white">All Brands</Link></li>
            <li><Link href="/search" className="hover:text-white">Search Parts</Link></li>
            <li><Link href="/quick-order" className="hover:text-white">Quick Order Pad</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Resources</h4>
          <ul className="space-y-2">
            <li><span className="text-slate-500">Datasheets Archive</span></li>
            <li><span className="text-slate-500">Cross-Reference Tool</span></li>
            <li><span className="text-slate-500">Shipping Info</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Support — MENA</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Cairo, Egypt</li>
            <li>support@autoparts-mena.com</li>
            <li>Sun–Thu, 9:00–17:00 (Cairo)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AutoParts MENA — Authenticity guaranteed. CE · UL · ISO 9001 certified suppliers.
      </div>
    </footer>
  );
}
