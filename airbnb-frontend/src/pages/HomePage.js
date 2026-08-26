import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { accommodations, locations } from '../data/accommodations';
import Footer from '../components/Footer';
import './HomePage.css';

/**
 * HomePage — static home page with dynamic filter and all required sections:
 * 1. Hero Banner
 * 2. Inspiration for your next trip (location cards)
 * 3. Discover Airbnb Experiences (2 cards)
 * 4. ShopAirbnb Section
 * 5. Inspiration for future getaways (tabs)
 * 6. Static Footer
 */

const TABS = ['New York', 'Cape Town', 'Paris', 'London', 'Durban', 'Johannesburg'];

const inspirationCards = [
  { location: 'New York', distance: '1 hour away', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300' },
  { location: 'Cape Town', distance: '2 hours away', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=300' },
  { location: 'Paris', distance: '8 hours away', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300' },
  { location: 'London', distance: '11 hours away', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300' },
  { location: 'Durban', distance: '1 hour away', img: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=300' },
  { location: 'Johannesburg', distance: '30 min away', img: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=300' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const tabAccommodations = accommodations.filter(
    (a) => a.location === activeTab
  );

  return (
    <div className="home-page">
      {/* ── 1. Hero Banner ────────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero banner">
        <div className="hero__overlay" />
        <div className="hero__content">
          <h1 className="hero__title">Not sure where to go?<br />Perfect.</h1>
          <button
            className="hero__cta"
            onClick={() => navigate('/location/New York')}
          >
            I'm flexible
          </button>
        </div>
      </section>

      <div className="home-page__sections">
        {/* ── 2. Inspiration Section ────────────────────────────────── */}
        <section className="inspiration" aria-labelledby="inspiration-heading">
          <h2 id="inspiration-heading" className="section-title">
            Inspiration for your next trip
          </h2>
          <div className="inspiration__grid">
            {inspirationCards.map((card) => (
              <button
                key={card.location}
                className="inspiration-card"
                onClick={() => navigate(`/location/${encodeURIComponent(card.location)}`)}
                aria-label={`Explore ${card.location}`}
              >
                <img
                  src={card.img}
                  alt={card.location}
                  className="inspiration-card__img"
                  loading="lazy"
                />
                <div className="inspiration-card__info">
                  <strong>{card.location}</strong>
                  <span>{card.distance}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Discover Airbnb Experiences ───────────────────────── */}
        <section className="experiences" aria-labelledby="experiences-heading">
          <h2 id="experiences-heading" className="section-title">
            Discover Airbnb Experiences
          </h2>
          <div className="experiences__grid">
            {/* Things to do on your trip */}
            <div
              className="experiences-card"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600)' }}
            >
              <div className="experiences-card__overlay" />
              <div className="experiences-card__content">
                <h3>Things to do on your trip</h3>
                <button
                  className="experiences-card__btn"
                  onClick={() => navigate('/location/New York')}
                >
                  Experiences
                </button>
              </div>
            </div>

            {/* Things to do at home */}
            <div
              className="experiences-card"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516571748831-5d81767b788d?w=600)' }}
            >
              <div className="experiences-card__overlay" />
              <div className="experiences-card__content">
                <h3>Things to do at home</h3>
                <button
                  className="experiences-card__btn"
                  onClick={() => navigate('/location/Cape Town')}
                >
                  Online Experiences
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. ShopAirbnb Section ─────────────────────────────────── */}
        <section className="shop-airbnb" aria-labelledby="shop-heading">
          <div className="shop-airbnb__text">
            <h2 id="shop-heading" className="section-title">
              Shop Airbnb gift cards
            </h2>
            <p className="shop-airbnb__sub">
              Give the gift of travel — for any occasion.
            </p>
            <button className="btn-outline">
              Shop now <FaArrowRight size={12} />
            </button>
          </div>
          <div className="shop-airbnb__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500"
              alt="Airbnb gift cards"
              className="shop-airbnb__img"
              loading="lazy"
            />
          </div>
        </section>

        {/* ── 5. Inspiration for Future Getaways (Tabs) ────────────── */}
        <section className="getaways" aria-labelledby="getaways-heading">
          <h2 id="getaways-heading" className="section-title">
            Inspiration for future getaways
          </h2>

          {/* Tab buttons */}
          <div className="getaways__tabs" role="tablist" aria-label="Locations">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`getaways__tab ${activeTab === tab ? 'getaways__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content — list of accommodations */}
          <div className="getaways__content" role="tabpanel" aria-label={activeTab}>
            {tabAccommodations.length === 0 ? (
              <p className="getaways__empty">No listings found for {activeTab}.</p>
            ) : (
              <ul className="getaways__list">
                {tabAccommodations.map((acc) => (
                  <li key={acc._id} className="getaways__item">
                    <button
                      className="getaways__item-btn"
                      onClick={() => navigate(`/location/${encodeURIComponent(acc.location)}/${acc._id}`)}
                    >
                      <span className="getaways__item-title">{acc.title}</span>
                      <span className="getaways__item-price">${acc.price} / night</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── 6. Footer ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default HomePage;
