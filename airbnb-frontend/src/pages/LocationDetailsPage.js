import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import {
  FaArrowLeft,
  FaHeart,
  FaShare,
  FaStar,
  FaUser,
  FaUsers,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaUtensils,
  FaTv,
  FaSnowflake,
  FaCheck,
  FaCalendarAlt,
} from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';

import api from '../api/axiosConfig';

import Footer from '../components/Footer';

import './LocationDetailsPage.css';


/* =====================================================
   DESTINATION-SPECIFIC IMAGE COLLECTIONS

   These are used when MongoDB contains:
   /uploads/placeholder-ny.jpg

   The images now depend on the listing destination.
   ===================================================== */

const DESTINATION_IMAGES = {

  /* =====================================================
     NEW YORK
     ===================================================== */

  'new york': [
    'https://images.unsplash.com/photo-1485871981521-5b1f1e1f6b5e?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     CAPE TOWN
     ===================================================== */

  'cape town': [
    'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     PARIS
     ===================================================== */

  paris: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     LONDON
     ===================================================== */

  london: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     DUBAI
     ===================================================== */

  dubai: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     TOKYO
     ===================================================== */

  tokyo: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     JOHANNESBURG
     ===================================================== */

  johannesburg: [
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     MIAMI
     ===================================================== */

  miami: [
    'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     LOS ANGELES
     ===================================================== */

  'los angeles': [
    'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1548393488-ae8f117cbc1c?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1515894347710-7d65b7b4c4c5?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1000&q=85',
  ],


  /* =====================================================
     NAIROBI
     ===================================================== */

  nairobi: [
    'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=1400&q=85',

    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=85',

    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1000&q=85',
  ],

};


/* =====================================================
   FALLBACK IMAGES

   Used if the destination isn't in the list above.
   ===================================================== */

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',

  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',

  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',

  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',

  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=85',
];


/* =====================================================
   GET DESTINATION IMAGES
   ===================================================== */

const getDestinationImages = (listing) => {

  const locationText =
    String(
      listing?.location ||
      listing?.city ||
      ''
    ).toLowerCase().trim();

  const titleText =
    String(
      listing?.title ||
      ''
    ).toLowerCase();

  const searchText =
    `${locationText} ${titleText}`;


  /* =====================================================
     CHECK KNOWN DESTINATIONS
     ===================================================== */

  const destinations =
    Object.keys(DESTINATION_IMAGES);


  const matchedDestination =
    destinations.find((destination) =>
      searchText.includes(destination)
    );


  if (matchedDestination) {
    return DESTINATION_IMAGES[
      matchedDestination
    ];
  }


  /* =====================================================
     FALLBACK
     ===================================================== */

  return DEFAULT_IMAGES;
};


/* =====================================================
   IMAGE URL HELPER

   Real external MongoDB images are preserved.

   Old local placeholder images are replaced with
   destination-specific images.
   ===================================================== */

const getImageUrl = (
  img,
  index = 0,
  destinationImages = DEFAULT_IMAGES
) => {

  /* No image */

  if (!img) {
    return destinationImages[
      index % destinationImages.length
    ];
  }


  /* Old local placeholder */

  if (
    img.includes('/uploads/') ||
    img.includes('placeholder')
  ) {

    return destinationImages[
      index % destinationImages.length
    ];

  }


  /* Real external image */

  if (
    img.startsWith('http://') ||
    img.startsWith('https://')
  ) {

    return img;

  }


  /* Anything unexpected */

  return destinationImages[
    index % destinationImages.length
  ];
};


/* =====================================================
   LOCATION DETAILS PAGE
   ===================================================== */

const LocationDetailsPage = () => {

  const { location, id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  const [listing, setListing] =
    useState(null);

  const [activeImg, setActiveImg] =
    useState(0);

  const [startDate, setStartDate] =
    useState(null);

  const [endDate, setEndDate] =
    useState(null);

  const [guests, setGuests] =
    useState(1);

  const [isFavourite, setIsFavourite] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showAllAmenities, setShowAllAmenities] =
    useState(false);


  /* =====================================================
     FETCH LISTING
     ===================================================== */

  useEffect(() => {

    const fetchListing = async () => {

      try {

        setLoading(true);

        setError('');

        const { data } =
          await api.get(
            `/api/accommodations/${id}`
          );

        setListing(data);

      } catch (err) {

        console.error(
          'Failed to fetch accommodation:',
          err
        );

        setError(
          'Unable to load this accommodation.'
        );

        setListing(null);

      } finally {

        setLoading(false);

      }

    };


    if (id) {
      fetchListing();
    }

  }, [id]);


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <>
        <main className="details-page">

          <div className="details-loading">

            <p>
              Loading accommodation...
            </p>

          </div>

        </main>

        <Footer />
      </>
    );

  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error || !listing) {

    return (
      <>
        <main className="details-page">

          <div className="details-error">

            <h2>
              Accommodation not found
            </h2>

            <p>
              {error ||
                'We could not find this accommodation.'}
            </p>

            <button
              className="details-back-btn"
              onClick={() =>
                navigate(
                  `/location/${encodeURIComponent(
                    location
                  )}`
                )
              }
            >

              <FaArrowLeft />

              Back to listings

            </button>

          </div>

        </main>

        <Footer />
      </>
    );

  }


  /* =====================================================
     IMAGES

     IMPORTANT:

     We now determine the image collection from
     the destination.

     Example:

     New York
       -> New York images

     Cape Town
       -> Cape Town images

     Paris
       -> Paris images
     ===================================================== */

  const destinationImages =
    getDestinationImages(listing);


  let images = [];


  /* =====================================================
     USE MONGODB IMAGES
     ===================================================== */

  if (
    Array.isArray(listing.images) &&
    listing.images.length > 0
  ) {

    images =
      listing.images.map(
        (img, index) =>
          getImageUrl(
            img,
            index,
            destinationImages
          )
      );

  }


  /* =====================================================
     ADD DESTINATION-SPECIFIC IMAGES

     We only add images when necessary.

     This prevents the same image from appearing
     repeatedly.
     ===================================================== */

  destinationImages.forEach(
    (destinationImage) => {

      if (
        images.length < 5 &&
        !images.includes(destinationImage)
      ) {

        images.push(
          destinationImage
        );

      }

    }
  );


  /* =====================================================
     FALLBACK

     Make absolutely sure the gallery has images.
     ===================================================== */

  if (images.length === 0) {

    images = [
      ...destinationImages
    ];

  }


  /* =====================================================
     REMOVE DUPLICATE IMAGES

     This protects the gallery if MongoDB contains
     duplicate image URLs.
     ===================================================== */

  images = [
    ...new Set(images)
  ];


  /* =====================================================
     MAKE SURE WE HAVE 5 IMAGES

     If the destination collection somehow has fewer
     than 5 unique images, use the general fallback
     collection without duplicating images.
     ===================================================== */

  if (images.length < 5) {

    DEFAULT_IMAGES.forEach(
      (defaultImage) => {

        if (
          images.length < 5 &&
          !images.includes(defaultImage)
        ) {

          images.push(
            defaultImage
          );

        }

      }
    );

  }


  /* =====================================================
     AMENITIES
     ===================================================== */

  const amenities =
    Array.isArray(listing.amenities)
      ? listing.amenities
      : [];


  /* =====================================================
     REVIEWS
     ===================================================== */

  const reviews =
    Array.isArray(listing.reviews)
      ? listing.reviews
      : [];


  /* =====================================================
     PRICE CALCULATION
     ===================================================== */

  let nights = 0;


  if (startDate && endDate) {

    const difference =
      endDate.getTime() -
      startDate.getTime();

    nights = Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );

  }


  const pricePerNight =
    Number(listing.price) || 0;


  const cleaningFee =
    Number(
      listing.cleaningFee ||
      listing.cleaning_fee
    ) || 0;


  const serviceFee =
    Number(
      listing.serviceFee ||
      listing.service_fee
    ) || 0;


  const accommodationCost =
    nights * pricePerNight;


  const total =
    accommodationCost +
    cleaningFee +
    serviceFee;


  /* =====================================================
     AMENITY ICON
     ===================================================== */

  const getAmenityIcon = (amenity) => {

    const value =
      String(amenity).toLowerCase();


    if (value.includes('wifi')) {
      return <FaWifi />;
    }


    if (
      value.includes('parking') ||
      value.includes('garage')
    ) {
      return <FaParking />;
    }


    if (
      value.includes('pool') ||
      value.includes('swimming')
    ) {
      return <FaSwimmingPool />;
    }


    if (
      value.includes('kitchen') ||
      value.includes('cooking')
    ) {
      return <FaUtensils />;
    }


    if (
      value.includes('tv') ||
      value.includes('television')
    ) {
      return <FaTv />;
    }


    if (
      value.includes('air') ||
      value.includes('conditioning')
    ) {
      return <FaSnowflake />;
    }


    return <FaCheck />;

  };


  /* =====================================================
     RESERVATION STATE
     ===================================================== */

  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [reserveSuccess, setReserveSuccess] = useState('');

  /* =====================================================
     RESERVATION — calls the backend API
     ===================================================== */

  const handleReserve = async () => {

    // Must be logged in
    if (!user) {
      setReserveError('Please log in to make a reservation.');
      return;
    }

    // Dates must be selected
    if (!startDate || !endDate) {
      setReserveError('Please select your check-in and check-out dates.');
      return;
    }

    if (nights <= 0) {
      setReserveError('Check-out must be after check-in.');
      return;
    }

    if (guests < 1) {
      setReserveError('Please select at least one guest.');
      return;
    }

    setReserving(true);
    setReserveError('');
    setReserveSuccess('');

    try {
      await api.post('/api/reservations', {
        accommodationId: listing._id,
        checkIn: startDate.toISOString(),
        checkOut: endDate.toISOString(),
        guests,
      });

      setReserveSuccess(
        `Reservation confirmed for ${nights} night${nights > 1 ? 's' : ''}! Total: $${total.toFixed(2)}`
      );
      // Reset dates so user sees a clean form
      setStartDate(null);
      setEndDate(null);
    } catch (err) {
      setReserveError(
        err.response?.data?.message || 'Reservation failed. Please try again.'
      );
    } finally {
      setReserving(false);
    }

  };


  /* =====================================================
     FAVOURITE
     ===================================================== */

  const handleFavourite = () => {

    setIsFavourite(
      !isFavourite
    );

  };


  /* =====================================================
     SHARE
     ===================================================== */

  const handleShare = async () => {

    const shareData = {

      title: listing.title,

      text:
        `Check out ${listing.title}`,

      url:
        window.location.href,

    };


    try {

      if (navigator.share) {

        await navigator.share(
          shareData
        );

      } else {

        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          'Link copied to clipboard!'
        );

      }

    } catch (err) {

      console.log(
        'Share cancelled.'
      );

    }

  };


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <>

      <main className="details-page">

        <div className="details-container">


          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            className="details-back-btn"
            onClick={() =>
              navigate(
                `/location/${encodeURIComponent(
                  location
                )}`
              )
            }
          >

            <FaArrowLeft />

            Back

          </button>


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="details-header">

            <div>

              <h1 className="details-title">

                {listing.title}

              </h1>


              <div className="details-meta">

                <span>

                  <FaStar />

                  {listing.rating || 'New'}

                </span>


                {listing.reviewsCount !==
                  undefined && (

                  <span>

                    {listing.reviewsCount}{' '}

                    reviews

                  </span>

                )}


                <span>

                  {listing.location}

                </span>

              </div>

            </div>


            {/* ACTION BUTTONS */}

            <div className="details-actions">

              <button
                onClick={handleShare}
                className="details-action-btn"
              >

                <FaShare />

                Share

              </button>


              <button
                onClick={handleFavourite}
                className={`details-action-btn ${
                  isFavourite
                    ? 'details-action-btn--active'
                    : ''
                }`}
              >

                <FaHeart />

                Save

              </button>

            </div>

          </div>


          {/* =================================================
              IMAGE GALLERY
          ================================================= */}

          <div className="details-gallery">


            {/* MAIN IMAGE */}

            <div className="details-gallery__main">

              <img
                src={
                  images[activeImg] ||
                  destinationImages[0]
                }

                alt={listing.title}

                className="details-gallery__main-img"

                onError={(e) => {

                  e.currentTarget.src =
                    destinationImages[
                      activeImg %
                      destinationImages.length
                    ];

                }}

              />

            </div>


            {/* FOUR SMALL IMAGES */}

            <div className="details-gallery__grid">

              {images
                .slice(1, 5)
                .map((img, i) => (

                  <button
                    key={i}

                    className={`details-gallery__thumb-btn ${
                      activeImg === i + 1
                        ? 'details-gallery__thumb-btn--active'
                        : ''
                    }`}

                    onClick={() =>
                      setActiveImg(
                        i + 1
                      )
                    }

                    aria-label={
                      `View image ${i + 2}`
                    }
                  >

                    <img
                      src={img}

                      alt={
                        `${listing.title} ${
                          i + 2
                        }`
                      }

                      className="details-gallery__thumb"

                      onError={(e) => {

                        e.currentTarget.src =
                          destinationImages[
                            (i + 1) %
                            destinationImages.length
                          ];

                      }}

                    />

                  </button>

                ))}

            </div>

          </div>


          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="details-content">


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <section className="details-main">


              {/* HOST */}

              <div className="details-host">

                <div>

                  <h2>

                    {listing.type ||
                      'Entire accommodation'}

                  </h2>


                  <p>

                    {listing.guests ||
                      listing.maxGuests ||
                      1}{' '}

                    guest

                    {(
                      listing.guests ||
                      listing.maxGuests ||
                      1
                    ) > 1
                      ? 's'
                      : ''}

                    {' · '}

                    {listing.bedrooms ||
                      1}{' '}

                    bedroom

                    {listing.bedrooms !==
                      1
                      ? 's'
                      : ''}

                    {' · '}

                    {listing.bathrooms ||
                      1}{' '}

                    bathroom

                    {listing.bathrooms !==
                      1
                      ? 's'
                      : ''}

                  </p>

                </div>


                {/* HOST AVATAR */}

                <div className="details-host-avatar">

                  {listing.host?.avatar ? (

                    <img
                      src={
                        listing.host.avatar.startsWith(
                          'http'
                        )
                          ? listing.host.avatar
                          : ''
                      }

                      alt={
                        listing.host.name ||
                        'Host'
                      }

                      onError={(e) => {

                        e.currentTarget.style.display =
                          'none';

                      }}

                    />

                  ) : (

                    <FaUser />

                  )}

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="details-section">

                <h2>
                  About this place
                </h2>


                <p className="details-description">

                  {listing.description ||
                    'Enjoy a comfortable stay at this beautiful accommodation.'}

                </p>

              </div>


              {/* AMENITIES */}

              {amenities.length > 0 && (

                <div className="details-section">

                  <h2>
                    What this place offers
                  </h2>


                  <div className="details-amenities">

                    {(
                      showAllAmenities
                        ? amenities
                        : amenities.slice(0, 8)
                    ).map(
                      (
                        amenity,
                        index
                      ) => (

                        <div
                          key={index}
                          className="details-amenity"
                        >

                          <span className="details-amenity__icon">

                            {getAmenityIcon(
                              amenity
                            )}

                          </span>


                          <span>

                            {amenity}

                          </span>

                        </div>

                      )
                    )}

                  </div>


                  {amenities.length > 8 && (

                    <button
                      className="details-show-more"

                      onClick={() =>
                        setShowAllAmenities(
                          !showAllAmenities
                        )
                      }
                    >

                      {showAllAmenities
                        ? 'Show less'
                        : `Show all ${amenities.length} amenities`}

                    </button>

                  )}

                </div>

              )}


              {/* REVIEWS */}

              <div className="details-section">

                <h2>

                  <FaStar />

                  {listing.rating ||
                    'New'}


                  {reviews.length > 0 && (

                    <>

                      {' · '}

                      {reviews.length}{' '}
                      reviews

                    </>

                  )}

                </h2>


                {reviews.length > 0 ? (

                  <div className="details-reviews">

                    {reviews
                      .slice(0, 6)
                      .map(
                        (
                          review,
                          index
                        ) => (

                          <div
                            key={index}
                            className="details-review"
                          >

                            <div className="details-review__user">

                              <div className="details-review__avatar">

                                <FaUser />

                              </div>


                              <div>

                                <strong>

                                  {review.user?.name ||
                                    review.name ||
                                    'Guest'}

                                </strong>


                                <span>

                                  {review.date ||
                                    ''}

                                </span>

                              </div>

                            </div>


                            <p>

                              {review.comment ||
                                review.text ||
                                'Great stay!'}

                            </p>

                          </div>

                        )
                      )}

                  </div>

                ) : (

                  <p>

                    This listing does not have any
                    reviews yet.

                  </p>

                )}

              </div>

            </section>


            {/* =================================================
                BOOKING CARD
            ================================================= */}

            <aside className="details-booking">


              {/* PRICE */}

              <div className="details-booking__price">

                <strong>

                  ${pricePerNight}

                </strong>


                <span>

                  / night

                </span>

              </div>


              {/* DATES */}

              <div className="details-booking__dates">


                {/* CHECK-IN */}

                <div className="details-booking__field">

                  <label>
                    Check-in
                  </label>


                  <div className="details-date-input">

                    <FaCalendarAlt />


                    <DatePicker
                      selected={startDate}

                      onChange={(date) =>
                        setStartDate(date)
                      }

                      selectsStart

                      startDate={startDate}

                      endDate={endDate}

                      minDate={new Date()}

                      placeholderText="Add date"

                      dateFormat="dd/MM/yyyy"
                    />

                  </div>

                </div>


                {/* CHECK-OUT */}

                <div className="details-booking__field">

                  <label>
                    Check-out
                  </label>


                  <div className="details-date-input">

                    <FaCalendarAlt />


                    <DatePicker
                      selected={endDate}

                      onChange={(date) =>
                        setEndDate(date)
                      }

                      selectsEnd

                      startDate={startDate}

                      endDate={endDate}

                      minDate={
                        startDate ||
                        new Date()
                      }

                      placeholderText="Add date"

                      dateFormat="dd/MM/yyyy"
                    />

                  </div>

                </div>

              </div>


              {/* GUESTS */}

              <div className="details-booking__field">

                <label>
                  Guests
                </label>


                <div className="details-guests">

                  <FaUsers />


                  <select
                    value={guests}

                    onChange={(e) =>
                      setGuests(
                        Number(
                          e.target.value
                        )
                      )
                    }
                  >

                    {Array.from(
                      {
                        length:
                          listing.guests ||
                          listing.maxGuests ||
                          10,
                      },

                      (
                        _,
                        index
                      ) => (

                        <option
                          key={
                            index + 1
                          }

                          value={
                            index + 1
                          }
                        >

                          {index + 1}{' '}

                          guest

                          {index > 0
                            ? 's'
                            : ''}

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              {/* RESERVE */}

              <button
                className="details-reserve-btn"
                onClick={handleReserve}
                disabled={reserving}
                aria-busy={reserving}
              >
                {reserving ? 'Reserving…' : 'Reserve'}
              </button>

              {/* Feedback messages */}
              {reserveError && (
                <p className="details-reserve-error" role="alert">
                  {reserveError}
                </p>
              )}
              {reserveSuccess && (
                <p className="details-reserve-success" role="status">
                  {reserveSuccess}
                </p>
              )}


              <p className="details-booking__note">

                You won't be charged yet

              </p>


              {/* PRICE BREAKDOWN */}

              {nights > 0 && (

                <div className="details-price-breakdown">


                  {/* ACCOMMODATION */}

                  <div>

                    <span>

                      ${pricePerNight} ×{' '}

                      {nights}{' '}

                      night

                      {nights > 1
                        ? 's'
                        : ''}

                    </span>


                    <span>

                      ${accommodationCost}

                    </span>

                  </div>


                  {/* CLEANING FEE */}

                  {cleaningFee > 0 && (

                    <div>

                      <span>
                        Cleaning fee
                      </span>


                      <span>
                        ${cleaningFee}
                      </span>

                    </div>

                  )}


                  {/* SERVICE FEE */}

                  {serviceFee > 0 && (

                    <div>

                      <span>
                        Service fee
                      </span>


                      <span>
                        ${serviceFee}
                      </span>

                    </div>

                  )}


                  {/* TOTAL */}

                  <div className="details-price-total">

                    <strong>
                      Total
                    </strong>


                    <strong>
                      ${total}
                    </strong>

                  </div>

                </div>

              )}

            </aside>

          </div>

        </div>

      </main>


      <Footer />

    </>
  );

};


export default LocationDetailsPage;