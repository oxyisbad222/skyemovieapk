async function handler({ query, type = "multi", page = 1 }) {
  if (!query || query.trim() === "") {
    return {
      error: "Search query is required",
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const TMDB_API_KEY = "cf4df30d74d9e322e596d876fd7db13e";

  try {
    let searchUrl;

    // Handle different search types and popular content
    if (query.toLowerCase() === "popular") {
      if (type === "movie") {
        searchUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      } else if (type === "tv") {
        searchUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      } else {
        // For multi, get popular movies
        searchUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      }
    } else {
      // Regular search
      searchUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&page=${page}`;
    }

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    const results = data.results.map((item) => {
      const isMovie =
        item.media_type === "movie" || type === "movie" || !item.media_type;
      const isTv = item.media_type === "tv" || type === "tv";

      return {
        id: item.id,
        tmdb_id: item.id,
        title: isMovie ? item.title : item.name,
        original_title: isMovie ? item.original_title : item.original_name,
        overview: item.overview,
        poster_path: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        backdrop_path: item.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
          : null,
        release_date: isMovie ? item.release_date : item.first_air_date,
        vote_average: item.vote_average,
        vote_count: item.vote_count,
        popularity: item.popularity,
        genre_ids: item.genre_ids,
        adult: item.adult,
        original_language: item.original_language,
        media_type: item.media_type || type,
        year: isMovie
          ? item.release_date
            ? new Date(item.release_date).getFullYear()
            : null
          : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : null,
      };
    });

    return {
      results: results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      query: query,
      search_type: type,
    };
  } catch (error) {
    return {
      error: `Search failed: ${error.message}`,
      results: [],
      total_pages: 0,
      total_results: 0,
      query: query,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}