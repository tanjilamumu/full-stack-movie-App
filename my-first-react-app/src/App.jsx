import {useEffect, useState} from 'react';
import Search from './components/Search.jsx';
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from "react-use";
import {updateSearchCount, getTrendingMovies} from "./appwrite.js";
import Spinner from "./components/Spinner.jsx";


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {

    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS)

            if(!response.ok) {
                throw new Error('Failed to fetch movie data.');
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;

            }

            setMovieList(data.results || [])

            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

        } catch (error) {
            console.error('Error fetching movies:', error);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try{
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        }catch(error){
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);


    return (
        <main>
            <div className="pattern" />

            <div className="wrapper" >
            <header>
                <img src="/full-stack-movie-App/hero.png" alt="Hero Banner" />

                <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>


                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.searchTerm} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}


                <section className="all-movies">
                   <h2>All Movies</h2>


                    {loading ? (
                        <Spinner/>
                    ): errorMessage ? (
                        <p className="text-white">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )
                    }
                </section>
            </div>
        </main>
    )
}

export default App;