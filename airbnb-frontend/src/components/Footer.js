import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Footer.css';

/**
 * Footer — static footer with 4 columns of links + copyright footer.
 * Matches the brief: list of links in 4 columns, copyright text,
 * social links, language selector, currency selector.
 */
const Footer = () => {
  const columns = [
    {
      heading: 'Support',
      links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighbourhood concern'],
    },
    {
      heading: 'Community',
      links: ['Airbnb.org: disaster relief', 'Support Afghan refugees', 'Combating discrimination'],
    },
    {
      heading: 'Hosting',
      links: ['Airbnb your home', 'AirCover for Hosts', 'Explore hosting resources', 'Visit our community forum', 'How to host responsibly'],
    },
    {
      heading: 'Airbnb',
      links: ['Newsroom', 'Learn about new features', 'Letter from our founders', 'Careers', 'Investors', 'Gift cards'],
    },
  ];

  return (
    <footer className="footer" role="contentinfo">
      {/* Link columns */}
      <div className="footer__links">
        {columns.map((col) => (
          <div key={col.heading} className="footer__column">
            <h3 className="footer__heading">{col.heading}</h3>
            <ul className="footer__list">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#/" className="footer__link" onClick={(e) => e.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright footer */}
      <div className="footer__copyright">
        <div className="footer__copyright-left">
          <span>© 2024 Airbnb, Inc.</span>
          <a href="#/" className="footer__copyright-link" onClick={(e) => e.preventDefault()}>Privacy</a>
          <a href="#/" className="footer__copyright-link" onClick={(e) => e.preventDefault()}>Terms</a>
          <a href="#/" className="footer__copyright-link" onClick={(e) => e.preventDefault()}>Sitemap</a>
          <a href="#/" className="footer__copyright-link" onClick={(e) => e.preventDefault()}>Company details</a>
        </div>

        <div className="footer__copyright-right">
          {/* Social links */}
          <a href="#/" className="footer__social-link" onClick={(e) => e.preventDefault()} aria-label="Facebook">
            <FaFacebook size={18} />
          </a>
          <a href="#/" className="footer__social-link" onClick={(e) => e.preventDefault()} aria-label="Twitter">
            <FaTwitter size={18} />
          </a>
          <a href="#/" className="footer__social-link" onClick={(e) => e.preventDefault()} aria-label="Instagram">
            <FaInstagram size={18} />
          </a>

          {/* Language selector */}
          <select className="footer__selector" aria-label="Select language">
            <option>English (ZA)</option>
            <option>English (US)</option>
            <option>Français</option>
            <option>Español</option>
          </select>

          {/* Currency selector */}
          <select className="footer__selector" aria-label="Select currency">
            <option>ZAR</option>
            <option>USD $</option>
            <option>EUR €</option>
            <option>GBP £</option>
          </select>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
