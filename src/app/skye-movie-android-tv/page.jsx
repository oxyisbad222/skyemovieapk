"use client";
import React from "react";

function MainComponent() {
  const [selectedCategory, setSelectedCategory] = React.useState("movies");
  const [focusedItem, setFocusedItem] = React.useState(0);
  const [movies, setMovies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showPlayer, setShowPlayer] = React.useState(false);
  const [currentMedia, setCurrentMedia] = React.useState(null);
  const [showSearch, setShowSearch] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [focusedCategory, setFocusedCategory] = React.useState(0);
  const [navigationMode, setNavigationMode] = React.useState("categories"); // "categories" or "content"

  // Set document title and favicon with error handling
  React.useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.head) {
        document.title = "Skye Movie - Android TV Streaming App";

        // Create favicon safely
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          favicon.type = "image/svg+xml";
          favicon.href =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎬</text></svg>'
            );
          document.head.appendChild(favicon);
        }

        // Add meta tags safely
        if (!document.querySelector('meta[name="viewport"]')) {
          const viewport = document.createElement("meta");
          viewport.name = "viewport";
          viewport.content =
            "width=device-width, initial-scale=1.0, user-scalable=no";
          document.head.appendChild(viewport);
        }

        if (!document.querySelector('meta[name="description"]')) {
          const description = document.createElement("meta");
          description.name = "description";
          description.content =
            "Skye Movie - Stream movies and TV shows on Android TV with Google TV remote support";
          document.head.appendChild(description);
        }
      }
    } catch (error) {
      console.error("Error setting up document head:", error);
    }
  }, []);

  // Load popular movies and TV shows on startup
  React.useEffect(() => {
    loadPopularContent();
  }, []);

  const loadPopularContent = async () => {
    setLoading(true);
    setError(null);

    console.log("Starting to load popular content...");

    try {
      // Load popular movies
      console.log("Fetching popular movies...");
      const movieResponse = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: "popular", type: "movie" }),
      });

      console.log("Movie response status:", movieResponse.status);

      if (!movieResponse.ok) {
        const errorText = await movieResponse.text();
        console.error("Movie API error response:", errorText);
        throw new Error(
          `Movie API error: ${movieResponse.status} ${movieResponse.statusText} - ${errorText}`
        );
      }

      const movieData = await movieResponse.json();
      console.log("Movie data received:", movieData);

      if (movieData.error) {
        throw new Error(movieData.error);
      }

      // Load popular TV shows
      console.log("Fetching popular TV shows...");
      const tvResponse = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: "popular", type: "tv" }),
      });

      console.log("TV response status:", tvResponse.status);

      if (!tvResponse.ok) {
        const errorText = await tvResponse.text();
        console.error("TV API error response:", errorText);
        throw new Error(
          `TV API error: ${tvResponse.status} ${tvResponse.statusText} - ${errorText}`
        );
      }

      const tvData = await tvResponse.json();
      console.log("TV data received:", tvData);

      if (tvData.error) {
        throw new Error(tvData.error);
      }

      const combinedContent = [
        ...(movieData.results || []).map((item) => ({
          ...item,
          category: "movies",
          title: item.title || item.name || "Unknown Title",
          poster_path: item.poster_path ? item.poster_path : null, // API already returns full URL
          tmdb_id: item.id || item.tmdb_id,
          media_type: "movie",
        })),
        ...(tvData.results || []).map((item) => ({
          ...item,
          category: "series",
          title: item.title || item.name || "Unknown Title",
          poster_path: item.poster_path ? item.poster_path : null, // API already returns full URL
          tmdb_id: item.id || item.tmdb_id,
          media_type: "tv",
        })),
      ];

      console.log("Combined content:", combinedContent.length, "items");
      setMovies(combinedContent);
    } catch (error) {
      console.error("Failed to load content:", error);
      setError(`Failed to load content: ${error.message}`);

      // Fallback: Set some dummy data so the app doesn't break completely
      setMovies([
        {
          id: 1,
          tmdb_id: 550,
          title: "Fight Club",
          category: "movies",
          media_type: "movie",
          poster_path: null,
          vote_average: 8.8,
        },
        {
          id: 2,
          tmdb_id: 1399,
          title: "Game of Thrones",
          category: "series",
          media_type: "tv",
          poster_path: null,
          vote_average: 9.2,
        },
      ]);
    }
    setLoading(false);
  };

  const loadTopContent = async () => {
    setLoading(true);
    setError(null);

    console.log("Starting to load top content...");

    try {
      // Load top movies
      console.log("Fetching top movies...");
      const movieResponse = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: "top", type: "movie" }),
      });

      console.log("Movie response status:", movieResponse.status);

      if (!movieResponse.ok) {
        const errorText = await movieResponse.text();
        console.error("Movie API error response:", errorText);
        throw new Error(
          `Movie API error: ${movieResponse.status} ${movieResponse.statusText} - ${errorText}`
        );
      }

      const movieData = await movieResponse.json();
      console.log("Movie data received:", movieData);

      if (movieData.error) {
        throw new Error(movieData.error);
      }

      // Load top TV shows
      console.log("Fetching top TV shows...");
      const tvResponse = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: "top", type: "tv" }),
      });

      console.log("TV response status:", tvResponse.status);

      if (!tvResponse.ok) {
        const errorText = await tvResponse.text();
        console.error("TV API error response:", errorText);
        throw new Error(
          `TV API error: ${tvResponse.status} ${tvResponse.statusText} - ${errorText}`
        );
      }

      const tvData = await tvResponse.json();
      console.log("TV data received:", tvData);

      if (tvData.error) {
        throw new Error(tvData.error);
      }

      const combinedContent = [
        ...(movieData.results || []).map((item) => ({
          ...item,
          category: "movies",
          title: item.title || item.name || "Unknown Title",
          poster_path: item.poster_path ? item.poster_path : null, // API already returns full URL
          tmdb_id: item.id || item.tmdb_id,
          media_type: "movie",
        })),
        ...(tvData.results || []).map((item) => ({
          ...item,
          category: "series",
          title: item.title || item.name || "Unknown Title",
          poster_path: item.poster_path ? item.poster_path : null, // API already returns full URL
          tmdb_id: item.id || item.tmdb_id,
          media_type: "tv",
        })),
      ];

      console.log("Combined content:", combinedContent.length, "items");
      setMovies(combinedContent);
    } catch (error) {
      console.error("Failed to load content:", error);
      setError(`Failed to load content: ${error.message}`);

      // Fallback: Set some dummy data so the app doesn't break completely
      setMovies([
        {
          id: 1,
          tmdb_id: 550,
          title: "Fight Club",
          category: "movies",
          media_type: "movie",
          poster_path: null,
          vote_average: 8.8,
        },
        {
          id: 2,
          tmdb_id: 1399,
          title: "Game of Thrones",
          category: "series",
          media_type: "tv",
          poster_path: null,
          vote_average: 9.2,
        },
      ]);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), type: "multi" }),
      });

      if (!response.ok) {
        throw new Error(
          `Search API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const processedResults = (data.results || []).map((item) => ({
        ...item,
        title: item.title || item.name || "Unknown Title",
        poster_path: item.poster_path || null, // API already returns full URL
        tmdb_id: item.tmdb_id || item.id,
        media_type: item.media_type || (item.first_air_date ? "tv" : "movie"),
      }));

      setSearchResults(processedResults);
    } catch (error) {
      console.error("Search error:", error);
      setError(`Search failed: ${error.message}`);
    }
    setIsSearching(false);
  };

  const playMedia = (media) => {
    if (!media || !media.tmdb_id) {
      setError("Cannot play media: Invalid media data");
      return;
    }
    setCurrentMedia(media);
    setShowPlayer(true);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentMedia(null);
  };

  // Enhanced Google TV remote control navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      try {
        // Player controls
        if (showPlayer) {
          if (
            e.key === "Escape" ||
            e.key === "Back" ||
            e.keyCode === 8 ||
            e.keyCode === 27
          ) {
            e.preventDefault();
            closePlayer();
          }
          return;
        }

        // Search controls
        if (showSearch) {
          if (
            e.key === "Escape" ||
            e.key === "Back" ||
            e.keyCode === 8 ||
            e.keyCode === 27
          ) {
            e.preventDefault();
            setShowSearch(false);
            setSearchQuery("");
            setSearchResults([]);
            setFocusedItem(0);
            setNavigationMode("categories");
          }
          return;
        }

        const categories = ["movies", "series", "documentaries"];
        const currentMovies =
          searchResults.length > 0
            ? searchResults
            : movies.filter((movie) => movie.category === selectedCategory);

        // Navigation logic
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            if (navigationMode === "content" && currentMovies.length > 0) {
              setNavigationMode("categories");
              setFocusedCategory(categories.indexOf(selectedCategory));
            }
            break;

          case "ArrowDown":
            e.preventDefault();
            if (navigationMode === "categories" && currentMovies.length > 0) {
              setNavigationMode("content");
              setFocusedItem(0);
            }
            break;

          case "ArrowLeft":
            e.preventDefault();
            if (navigationMode === "categories") {
              const newIndex = Math.max(0, focusedCategory - 1);
              setFocusedCategory(newIndex);
              setSelectedCategory(categories[newIndex]);
              setFocusedItem(0);
            } else if (navigationMode === "content") {
              setFocusedItem((prev) => Math.max(0, prev - 1));
            }
            break;

          case "ArrowRight":
            e.preventDefault();
            if (navigationMode === "categories") {
              const newIndex = Math.min(
                categories.length - 1,
                focusedCategory + 1
              );
              setFocusedCategory(newIndex);
              setSelectedCategory(categories[newIndex]);
              setFocusedItem(0);
            } else if (navigationMode === "content") {
              setFocusedItem((prev) =>
                Math.min(currentMovies.length - 1, prev + 1)
              );
            }
            break;

          case "Enter":
          case " ": // Space bar (OK button on some remotes)
            e.preventDefault();
            if (navigationMode === "content" && currentMovies[focusedItem]) {
              playMedia(currentMovies[focusedItem]);
            } else if (navigationMode === "categories") {
              setNavigationMode("content");
              setFocusedItem(0);
            }
            break;

          case "s":
          case "S":
            e.preventDefault();
            setShowSearch(true);
            setNavigationMode("categories");
            break;

          case "r":
          case "R":
            e.preventDefault();
            loadTopContent();
            break;

          case "Escape":
          case "Back":
            e.preventDefault();
            if (navigationMode === "content") {
              setNavigationMode("categories");
            }
            break;
        }

        // Handle numeric keycodes for older TV remotes
        switch (e.keyCode) {
          case 37: // Left arrow
            e.preventDefault();
            if (navigationMode === "categories") {
              const newIndex = Math.max(0, focusedCategory - 1);
              setFocusedCategory(newIndex);
              setSelectedCategory(categories[newIndex]);
              setFocusedItem(0);
            } else if (navigationMode === "content") {
              setFocusedItem((prev) => Math.max(0, prev - 1));
            }
            break;
          case 39: // Right arrow
            e.preventDefault();
            if (navigationMode === "categories") {
              const newIndex = Math.min(
                categories.length - 1,
                focusedCategory + 1
              );
              setFocusedCategory(newIndex);
              setSelectedCategory(categories[newIndex]);
              setFocusedItem(0);
            } else if (navigationMode === "content") {
              setFocusedItem((prev) =>
                Math.min(currentMovies.length - 1, prev + 1)
              );
            }
            break;
          case 38: // Up arrow
            e.preventDefault();
            if (navigationMode === "content" && currentMovies.length > 0) {
              setNavigationMode("categories");
              setFocusedCategory(categories.indexOf(selectedCategory));
            }
            break;
          case 40: // Down arrow
            e.preventDefault();
            if (navigationMode === "categories" && currentMovies.length > 0) {
              setNavigationMode("content");
              setFocusedItem(0);
            }
            break;
          case 13: // Enter
          case 32: // Space
            e.preventDefault();
            if (navigationMode === "content" && currentMovies[focusedItem]) {
              playMedia(currentMovies[focusedItem]);
            } else if (navigationMode === "categories") {
              setNavigationMode("content");
              setFocusedItem(0);
            }
            break;
        }
      } catch (error) {
        console.error("Keyboard navigation error:", error);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    selectedCategory,
    focusedItem,
    focusedCategory,
    navigationMode,
    movies,
    searchResults,
    showPlayer,
    showSearch,
  ]);

  const currentMovies =
    searchResults.length > 0
      ? searchResults
      : movies.filter((movie) => movie.category === selectedCategory);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "30px",
            animation: "pulse 2s infinite",
          }}
        >
          🎬
        </div>
        <div style={{ fontSize: "28px", marginBottom: "15px" }}>
          Loading Skye Movie...
        </div>
        <div
          style={{
            fontSize: "18px",
            opacity: 0.7,
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          Getting the latest movies and shows for your Google TV
        </div>
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (showPlayer && currentMedia) {
    // Enhanced player URL with Android TV optimizations
    let playerUrl;
    const playerParams = new URLSearchParams({
      autoPlay: "true",
      theme: "4ecdc4", // Match app's teal theme
      title: "true",
      poster: "true",
    });

    if (currentMedia.media_type === "movie") {
      playerUrl = `https://mappletv.uk/watch/movie/${
        currentMedia.tmdb_id
      }?${playerParams.toString()}`;
    } else {
      // For TV shows, default to Season 1 Episode 1 with enhanced features
      const tvParams = new URLSearchParams({
        autoPlay: "true",
        theme: "4ecdc4",
        title: "true",
        poster: "true",
        nextButton: "true", // Show next episode button
        autoNext: "false", // Don't auto-play next episode (user choice)
      });
      playerUrl = `https://mappletv.uk/watch/tv/${
        currentMedia.tmdb_id
      }-1-1?${tvParams.toString()}`;
    }

    return (
      <div
        style={{
          backgroundColor: "#000",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Enhanced player controls overlay */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            zIndex: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "16px",
              border: "2px solid #4ecdc4",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              pointerEvents: "auto",
            }}
          >
            <span style={{ fontSize: "20px" }}>⬅️</span>
            Press BACK to return
          </div>

          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.9)",
              color: "#4ecdc4",
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              border: "2px solid #4ecdc4",
              textAlign: "center",
              maxWidth: "300px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {currentMedia.media_type === "movie" ? "🎬 MOVIE" : "📺 TV SHOW"}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {currentMedia.title}
              {currentMedia.media_type === "tv" && " - S1E1"}
            </div>
          </div>
        </div>

        {/* Player iframe with enhanced error handling */}
        <iframe
          src={playerUrl}
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
          }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title={`Playing ${currentMedia.title || "Video"}`}
          onLoad={() => {
            console.log(`Player loaded successfully: ${currentMedia.title}`);
          }}
          onError={(e) => {
            console.error("Player iframe error:", e);
            setError("Failed to load video player. Please try again.");
            closePlayer();
          }}
        />

        {/* Loading indicator for slow connections */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "#4ecdc4",
            padding: "10px 15px",
            borderRadius: "8px",
            fontSize: "12px",
            border: "1px solid #4ecdc4",
            opacity: 0.7,
          }}
        >
          🎮 Use remote controls in player
        </div>
      </div>
    );
  }

  if (showSearch) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: "50px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "50px",
            gap: "30px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: "#4ecdc4",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            🔍 SEARCH
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search movies and TV shows..."
            autoFocus
            style={{
              flex: 1,
              padding: "20px 25px",
              fontSize: "20px",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              border: "3px solid #4ecdc4",
              borderRadius: "12px",
              outline: "none",
            }}
          />
          <div
            style={{
              fontSize: "16px",
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⬅️</span>
            BACK to close
          </div>
        </div>

        {isSearching && (
          <div
            style={{
              textAlign: "center",
              fontSize: "22px",
              margin: "50px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            <span
              style={{ fontSize: "28px", animation: "spin 1s linear infinite" }}
            >
              🔄
            </span>
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "25px",
              overflowX: "auto",
              paddingBottom: "30px",
            }}
          >
            {searchResults.map((media, index) => (
              <div
                key={`${media.id}-${index}`}
                style={{
                  minWidth: "220px",
                  textAlign: "center",
                  cursor: "pointer",
                  transform: focusedItem === index ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.3s ease",
                  border:
                    focusedItem === index
                      ? "4px solid #4ecdc4"
                      : "4px solid transparent",
                  borderRadius: "16px",
                  padding: "15px",
                  backgroundColor:
                    focusedItem === index ? "#1a1a1a" : "transparent",
                  boxShadow:
                    focusedItem === index
                      ? "0 0 20px rgba(78, 205, 196, 0.5)"
                      : "none",
                }}
                onClick={() => {
                  setFocusedItem(index);
                  setTimeout(() => playMedia(media), 100);
                }}
              >
                <img
                  src={
                    media.poster_path ||
                    "https://via.placeholder.com/300x450/333/fff?text=No+Image"
                  }
                  alt={media.title || "Movie Poster"}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "15px",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x450/333/fff?text=No+Image";
                  }}
                />
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: focusedItem === index ? "#4ecdc4" : "#fff",
                    marginBottom: "8px",
                    lineHeight: "1.3",
                  }}
                >
                  {media.title}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {media.media_type === "movie" ? "🎬 MOVIE" : "📺 TV SHOW"}
                  {media.release_date &&
                    ` (${new Date(media.release_date).getFullYear()})`}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div
            style={{
              textAlign: "center",
              fontSize: "22px",
              margin: "50px 0",
              opacity: 0.7,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <span style={{ fontSize: "48px" }}>😔</span>
            No results found for "{searchQuery}"
          </div>
        )}

        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "50px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "50px",
          borderBottom: "3px solid #333",
          paddingBottom: "30px",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            color: "#4ecdc4",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          🎬 SKYE MOVIE
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: "16px",
            opacity: 0.7,
            textAlign: "right",
            lineHeight: "1.4",
          }}
        >
          <div>🎮 Google TV Remote:</div>
          <div>↑↓ Navigate | OK Select | BACK Return | Search 🔍</div>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ff4444",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            fontSize: "18px",
          }}
        >
          <span style={{ fontSize: "24px" }}>⚠️</span>
          {error}
          <button
            onClick={loadTopContent}
            style={{
              backgroundColor: "transparent",
              border: "2px solid #fff",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Category Navigation */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "40px",
          justifyContent: "center",
        }}
      >
        {["movies", "series", "documentaries"].map((category, index) => (
          <div
            key={category}
            style={{
              padding: "18px 32px",
              fontSize: "22px",
              fontWeight: selectedCategory === category ? "bold" : "normal",
              color: selectedCategory === category ? "#4ecdc4" : "#fff",
              backgroundColor:
                selectedCategory === category ? "#1a1a1a" : "transparent",
              border:
                navigationMode === "categories" && focusedCategory === index
                  ? "4px solid #4ecdc4"
                  : selectedCategory === category
                  ? "3px solid #4ecdc4"
                  : "3px solid transparent",
              borderRadius: "12px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform:
                navigationMode === "categories" && focusedCategory === index
                  ? "scale(1.1)"
                  : "scale(1)",
              boxShadow:
                navigationMode === "categories" && focusedCategory === index
                  ? "0 0 20px rgba(78, 205, 196, 0.5)"
                  : "none",
              letterSpacing: "1px",
            }}
            onClick={() => {
              setSelectedCategory(category);
              setFocusedCategory(index);
              setFocusedItem(0);
              setNavigationMode("content");
            }}
          >
            {category === "movies" && "🎬 "}
            {category === "series" && "📺 "}
            {category === "documentaries" && "📖 "}
            {category}
          </div>
        ))}
      </div>

      {/* Movie Grid */}
      {currentMovies.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: "25px",
            overflowX: "auto",
            paddingBottom: "30px",
            paddingTop: "10px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {currentMovies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              style={{
                minWidth: "220px",
                textAlign: "center",
                cursor: "pointer",
                transform:
                  navigationMode === "content" && focusedItem === index
                    ? "scale(1.15)"
                    : "scale(1)",
                transition: "all 0.3s ease",
                border:
                  navigationMode === "content" && focusedItem === index
                    ? "4px solid #4ecdc4"
                    : "4px solid transparent",
                borderRadius: "16px",
                padding: "15px",
                backgroundColor:
                  navigationMode === "content" && focusedItem === index
                    ? "#1a1a1a"
                    : "transparent",
                boxShadow:
                  navigationMode === "content" && focusedItem === index
                    ? "0 0 20px rgba(78, 205, 196, 0.5)"
                    : "none",
              }}
              onClick={() => {
                setFocusedItem(index);
                setNavigationMode("content");
                setTimeout(() => playMedia(movie), 100);
              }}
            >
              <img
                src={
                  movie.poster_path ||
                  "https://via.placeholder.com/300x450/333/fff?text=No+Image"
                }
                alt={movie.title || "Movie Poster"}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "15px",
                }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x450/333/fff?text=No+Image";
                }}
              />
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color:
                    navigationMode === "content" && focusedItem === index
                      ? "#4ecdc4"
                      : "#fff",
                  marginBottom: "8px",
                  lineHeight: "1.3",
                }}
              >
                {movie.title}
              </div>
              {movie.vote_average && (
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.7,
                    marginBottom: "5px",
                  }}
                >
                  ⭐ {movie.vote_average.toFixed(1)}
                </div>
              )}
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {movie.category === "movies"
                  ? "🎬 MOVIE"
                  : movie.category === "series"
                  ? "📺 SERIES"
                  : "📖 DOC"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            fontSize: "22px",
            margin: "60px 0",
            opacity: 0.7,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <span style={{ fontSize: "64px" }}>📺</span>
          <div>No content available for {selectedCategory}</div>
          <button
            onClick={loadTopContent}
            style={{
              backgroundColor: "#4ecdc4",
              color: "#000",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔄 Refresh Content
          </button>
        </div>
      )}

      {/* Add CSS to hide scrollbar */}
      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Footer Instructions */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "50px",
          right: "50px",
          textAlign: "center",
          fontSize: "16px",
          opacity: 0.8,
          backgroundColor: "rgba(0,0,0,0.9)",
          padding: "15px 20px",
          borderRadius: "12px",
          border: "2px solid #333",
          lineHeight: "1.4",
        }}
      >
        <div
          style={{ marginBottom: "5px", fontWeight: "bold", color: "#4ecdc4" }}
        >
          🎮 Google TV Remote Controls:
        </div>
        <div>
          Direction Pad: Navigate | OK Button: Select/Play | BACK: Return |
          Voice: "Search" for 🔍
        </div>
      </div>
    </div>
  );
}

export default MainComponent;