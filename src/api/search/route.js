async function handler({ query, type = "multi", page = 1 }) {
  // Validate input parameters
  if (!query || typeof query !== "string" || query.trim() === "") {
    return {
      error: "Search query is required and must be a valid string",
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  // Sanitize inputs
  const cleanQuery = query.trim();
  const cleanType =
    type && typeof type === "string" ? type.toLowerCase() : "multi";
  const cleanPage = page && typeof page === "number" && page > 0 ? page : 1;

  // Use environment variable for TMDB API key with fallback for local testing
  const TMDB_API_KEY =
    process.env.TMDB_API_KEY || "cf4df30d74d9e322e596d876fd7db13e";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY environment variable is not set");
    return {
      error: "TMDB API key is not configured",
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  try {
    let searchUrl;

    // Handle different search types and top content of all time
    if (
      cleanQuery.toLowerCase() === "top" ||
      cleanQuery.toLowerCase() === "popular"
    ) {
      if (cleanType === "movie") {
        // Top rated movies of all time
        searchUrl = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${cleanPage}&language=en-US&region=US`;
      } else if (cleanType === "tv") {
        // Top rated TV shows of all time
        searchUrl = `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${cleanPage}&language=en-US`;
      } else if (cleanType === "documentary") {
        // Top documentaries using discover with documentary genre
        searchUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${cleanPage}&language=en-US&sort_by=vote_average.desc&vote_count.gte=100&with_genres=99`;
      } else {
        // For multi, get top rated movies by default
        searchUrl = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${cleanPage}&language=en-US&region=US`;
      }
    } else {
      // Regular search - ensure valid search type
      const validTypes = ["movie", "tv", "multi"];
      const searchType = validTypes.includes(cleanType) ? cleanType : "multi";
      searchUrl = `${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        cleanQuery
      )}&page=${cleanPage}&language=en-US&include_adult=false`;
    }

    console.log(
      `Making TMDB API request to: ${searchUrl.replace(
        TMDB_API_KEY,
        "[API_KEY]"
      )}`
    );

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Skye-Movie-App/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `TMDB API error: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results)) {
      console.error("Invalid TMDB API response:", data);
      throw new Error("Invalid response from TMDB API");
    }

    const results = data.results
      .map((item) => {
        if (!item || !item.id) {
          return null;
        }

        const isMovie =
          item.media_type === "movie" ||
          cleanType === "movie" ||
          cleanType === "documentary" ||
          (!item.media_type && item.title);
        const isTv =
          item.media_type === "tv" ||
          cleanType === "tv" ||
          (!item.media_type && item.name);

        return {
          id: item.id,
          tmdb_id: item.id,
          title: isMovie
            ? item.title || "Unknown Movie"
            : item.name || "Unknown TV Show",
          original_title: isMovie ? item.original_title : item.original_name,
          overview: item.overview || "",
          poster_path: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          backdrop_path: item.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
            : null,
          release_date: isMovie ? item.release_date : item.first_air_date,
          vote_average:
            typeof item.vote_average === "number" ? item.vote_average : 0,
          vote_count: typeof item.vote_count === "number" ? item.vote_count : 0,
          popularity: typeof item.popularity === "number" ? item.popularity : 0,
          genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
          adult: Boolean(item.adult),
          original_language: item.original_language || "en",
          media_type: item.media_type || (isMovie ? "movie" : "tv"),
          year: isMovie
            ? item.release_date
              ? new Date(item.release_date).getFullYear()
              : null
            : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : null,
        };
      })
      .filter(Boolean) // Remove null entries
      .filter((item) => item.vote_average > 0); // Only include items with ratings

    console.log(
      `Successfully processed ${results.length} results for query: ${cleanQuery}`
    );

    return {
      results: results,
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || results.length,
      query: cleanQuery,
      search_type: cleanType,
      success: true,
    };
  } catch (error) {
    console.error("Search API error:", error);

    return {
      error: `Search failed: ${error.message}`,
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
      query: cleanQuery,
      search_type: cleanType,
      success: false,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}