const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-white/10">
      {/* Gradient Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center glow">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold gradient-text">EventHub</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              Create, join, and experience amazing events around the globe. Your
              journey to unforgettable memories starts here.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {["twitter", "facebook", "instagram", "linkedin"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 glass-strong rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-300 group"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              {["Browse Events", "Create Event", "How it Works", "Pricing"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-4 h-px bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"></span>
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Guidelines",
                "Support",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2025 EventHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              Made with <span className="text-red-500 animate-pulse">❤️</span>{" "}
              for amazing events
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
