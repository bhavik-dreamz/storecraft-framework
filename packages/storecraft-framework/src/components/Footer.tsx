import React from 'react'
import { clsx } from 'clsx'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={clsx('bg-gray-50 border-t border-gray-200', className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8 xl:col-span-1">
            <div>
              <span className="text-2xl font-bold text-black">StoreCraft</span>
              <p className="mt-4 text-sm text-gray-600">
                Building beautiful e-commerce experiences with modern technology and thoughtful design.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Shop Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Shop
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/collections/all" className="text-base text-gray-500 hover:text-gray-900">
                      All Products
                    </a>
                  </li>
                  <li>
                    <a href="/collections/featured" className="text-base text-gray-500 hover:text-gray-900">
                      Featured
                    </a>
                  </li>
                  <li>
                    <a href="/collections/new" className="text-base text-gray-500 hover:text-gray-900">
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a href="/collections/sale" className="text-base text-gray-500 hover:text-gray-900">
                      Sale
                    </a>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Customer Service
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="/shipping" className="text-base text-gray-500 hover:text-gray-900">
                      Shipping Info
                    </a>
                  </li>
                  <li>
                    <a href="/returns" className="text-base text-gray-500 hover:text-gray-900">
                      Returns & Exchanges
                    </a>
                  </li>
                  <li>
                    <a href="/size-guide" className="text-base text-gray-500 hover:text-gray-900">
                      Size Guide
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Company
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/about" className="text-base text-gray-500 hover:text-gray-900">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/careers" className="text-base text-gray-500 hover:text-gray-900">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="text-base text-gray-500 hover:text-gray-900">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/press" className="text-base text-gray-500 hover:text-gray-900">
                      Press
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                  Legal
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/refund" className="text-base text-gray-500 hover:text-gray-900">
                      Refund Policy
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="text-base text-gray-500 hover:text-gray-900">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Get the latest updates on new products and upcoming sales.
              </p>
            </div>
            <form className="mt-4 sm:flex sm:max-w-md md:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter your email"
              />
              <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-black border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {/* Payment Icons */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">We accept:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">VISA</span>
                </div>
                <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">MC</span>
                </div>
                <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">PP</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {currentYear} StoreCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Icon Components
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12.017 0C8.396 0 7.929.01 7.102.048 6.273.088 5.718.222 5.238.42a4.838 4.838 0 00-1.771 1.154 4.838 4.838 0 00-1.154 1.771c-.198.48-.333 1.042-.372 1.871C2.01 7.929 2 8.396 2 12.017s.01 4.088.048 4.915c.04.828.174 1.391.372 1.871a4.838 4.838 0 001.154 1.771 4.838 4.838 0 001.771 1.154c.48.198 1.042.333 1.871.372.827.04 1.294.048 4.915.048s4.088-.01 4.915-.048c.828-.04 1.391-.174 1.871-.372a4.838 4.838 0 001.771-1.154 4.838 4.838 0 001.154-1.771c.198-.48.333-1.042.372-1.871.04-.827.048-1.294.048-4.915s-.01-4.088-.048-4.915c-.04-.828-.174-1.391-.372-1.871a4.838 4.838 0 00-1.154-1.771A4.838 4.838 0 0019.86.42c-.48-.198-1.042-.333-1.871-.372C17.088.01 16.621 0 12.017 0zM12.017 2.13c3.587 0 4.01.014 5.42.078.622.028 1.086.13 1.518.273.263.102.45.224.646.42.196.196.318.383.42.646.143.432.245.896.273 1.518.064 1.41.078 1.833.078 5.42s-.014 4.01-.078 5.42c-.028.622-.13 1.086-.273 1.518a1.708 1.708 0 01-.42.646 1.708 1.708 0 01-.646.42c-.432.143-.896.245-1.518.273-1.41.064-1.833.078-5.42.078s-4.01-.014-5.42-.078c-.622-.028-1.086-.13-1.518-.273a1.708 1.708 0 01-.646-.42 1.708 1.708 0 01-.42-.646c-.143-.432-.245-.896-.273-1.518-.064-1.41-.078-1.833-.078-5.42s.014-4.01.078-5.42c.028-.622.13-1.086.273-1.518.102-.263.224-.45.42-.646.196-.196.383-.318.646-.42.432-.143.896-.245 1.518-.273 1.41-.064 1.833-.078 5.42-.078zM12.017 15.858a3.84 3.84 0 100-7.68 3.84 3.84 0 000 7.68zm0-9.743a5.863 5.863 0 110 11.726 5.863 5.863 0 010-11.726zm7.5-1.894a1.371 1.371 0 11-2.742 0 1.371 1.371 0 012.742 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  )
}