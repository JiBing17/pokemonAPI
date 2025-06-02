import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import placeHolder from './static/placeholder.jpg';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export default function MovieDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, genres, durations, key } = location.state || {};
  const [similarMovies, setSimilarMovies] = useState([]);
  const [castMembers, setCastMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('Similar Movies');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!movie) return;

    const fetchSimilar = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${key}&language=en-US&page=1`
        );
        const data = await res.json();
        setSimilarMovies(data.results || []);
      } catch (err) {
        console.error('Error fetching similar movies:', err);
      }
    };

    const fetchCast = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${key}&language=en-US`
        );
        const data = await res.json();
        setCastMembers(data.cast || []);
      } catch (err) {
        console.error('Error fetching cast:', err);
      }
    };

    fetchSimilar();
    fetchCast();
  }, [movie, key]);

  const handleScroll = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: amount,
        behavior: 'smooth',
      });
    }
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No movie data available.</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* Backdrop + Overlay + Info */}
      <div className="relative">
        <img
          src={
            movie.backdrop_path
              ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
              : movie.poster_path
              ? `${POSTER_BASE_URL}${movie.poster_path}`
              : placeHolder
          }
          alt={movie.title}
          className="w-full h-[80vh] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 max-w-md bg-black bg-opacity-50 p-6 rounded-lg text-white">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="lg"
            onClick={() => navigate('/movies')}
            className="mb-4 cursor-pointer hover:text-gray-300"
          />

          <p className="text-sm">
            Duration:{' '}
            <span className="font-medium">
              {durations?.[movie.id] ?? 'NA'} mins
            </span>
          </p>

          <div className="flex items-center mt-2 mb-3 text-sm">
            <span className="font-semibold">⭐{movie.vote_average}</span>
            <span className="mx-2">|</span>
            <div className="flex flex-wrap text-xs">
              {movie.genre_ids.map((gId, idx) => {
                const name = genres?.[gId] || 'Unknown';
                const isLast = idx === movie.genre_ids.length - 1;
                return (
                  <span key={gId}>
                    {name}
                    {!isLast && <span className="mx-1">|</span>}
                  </span>
                );
              })}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>

          <div className="flex space-x-3">
            <button
              onClick={() =>
                window.open(
                  `https://www.themoviedb.org/movie/${movie.id}`,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Watch on TMDB
            </button>
            <button
              onClick={() => {
                /* Implement add-to-list logic here */
              }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm"
            >
              Add To List
            </button>
          </div>

          <p className="mt-4 text-sm">{movie.overview}</p>
        </div>
      </div>

      {/* Similar / Cast Section */}
      <div className="bg-gray-900">
        <div className="relative px-4 py-6">
          <div className="flex space-x-8 border-b border-gray-700 pb-2">
            <h4
              onClick={() => setActiveTab('Similar Movies')}
              className={`text-white cursor-pointer transition-all duration-300 ${
                activeTab === 'Similar Movies'
                  ? 'font-bold scale-110'
                  : 'font-light'
              }`}
            >
              Similar Movies
            </h4>
            <h4
              onClick={() => setActiveTab('Cast')}
              className={`text-white cursor-pointer transition-all duration-300 ${
                activeTab === 'Cast' ? 'font-bold scale-110' : 'font-light'
              }`}
            >
              Cast
            </h4>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 items-center mt-4 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {activeTab === 'Similar Movies'
              ? similarMovies.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex-none w-40 text-white cursor-pointer"
                    onClick={() =>
                      navigate(`/movie/${sim.id}`, {
                        state: {
                          movie: sim,
                          genres,
                          durations,
                          key,
                        },
                      })
                    }
                  >
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={
                          sim.poster_path
                            ? `${POSTER_BASE_URL}${sim.poster_path}`
                            : placeHolder
                        }
                        alt={sim.title}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                    <p className="text-left font-bold text-sm mt-2">
                      {sim.title}
                    </p>
                    <div className="flex justify-between text-xs mt-1">
                      <span>
                        {sim.release_date
                          ? sim.release_date.split('-')[0]
                          : 'N/A'}
                      </span>
                      <span>{sim.vote_average}/10</span>
                    </div>
                  </div>
                ))
              : castMembers.map((member) => (
                  <div key={member.cast_id || member.id} className="flex-none w-40 text-white">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={
                          member.profile_path
                            ? `${POSTER_BASE_URL}${member.profile_path}`
                            : placeHolder
                        }
                        alt={member.name}
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-2">
                        <p className="text-left font-bold text-xs">
                          {member.name}
                        </p>
                        <p className="text-left text-xs">
                          {member.character}
                        </p>
                      </div>
                      <span className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1 rounded-bl-lg">
                        🔥{Math.round(member.popularity)}
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          {/* Scroll Arrows */}
          <div
            onClick={() => handleScroll(-800)}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 z-20 text-white p-3 rounded-full bg-black bg-opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </div>
          <div
            onClick={() => handleScroll(800)}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 z-20 text-white p-3 rounded-full bg-black bg-opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowRight} size="lg" />
          </div>
        </div>
      </div>
    </>
  );
}
