'use client';

import Link from 'next/link';

export default function FooterEnhanced() {
  return (
    <>
      {/* Main Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 flex">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-4">Wortchamp</h3>
              <p className="text-gray-300 text-sm mb-4">
                Wordle Deutsch mit täglichem Wort, Endlos-Modus und Wortsuche.
              </p>
              <p className="text-gray-400 text-xs">
                Wortchamp © 2026
              </p>
            </div>

            {/* Game Modes */}
            <div>
              <h4 className="font-semibold mb-4">Spielmodi</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Wort des Tages
                  </Link>
                </li>
                <li>
                  <Link href="/wordle-anleitung#modi" className="text-gray-300 hover:text-white transition-colors">
                    Endlos-Modus
                  </Link>
                </li>
                <li>
                  <Link href="/wordle-anleitung#challenges" className="text-gray-300 hover:text-white transition-colors">
                    Eigene Challenges
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guides & Tips */}
            <div>
              <h4 className="font-semibold mb-4">Guides & Tipps</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/wordle-anleitung#strategien" className="text-gray-300 hover:text-white transition-colors">
                    Gewinnstrategien
                  </Link>
                </li>
                <li>
                  <Link href="/wordle-anleitung#intro" className="text-gray-300 hover:text-white transition-colors">
                    Tipps für das Tageswort
                  </Link>
                </li>
                <li>
                  <Link href="/wordle-anleitung#faq" className="text-gray-300 hover:text-white transition-colors">
                    Wordle Deutsch FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="mailto:hallo@wortchamp.com?subject=Wortchamp" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Kontakt
                  </a>
                </li>
                <li>
                  <Link href="/datenschutz" className="text-gray-300 hover:text-white transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/nutzungsbedingungen" className="text-gray-300 hover:text-white transition-colors">
                    Nutzungsbedingungen
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Wortchamp – Wordle Deutsch |
              <span className="ml-2">
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                  Jetzt spielen
                </Link>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
