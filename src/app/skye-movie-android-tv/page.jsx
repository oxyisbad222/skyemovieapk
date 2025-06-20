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

  // Load popular movies and TV shows on startup
  React.useEffect(() => {
    loadPopularContent();
  }, []);

  const loadPopularContent = async () => {
    setLoading(true);
    try {
      // Load popular movies
      const movieResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "popular", type: "movie" }),
      });

      if (movieResponse.ok) {
        const movieData = await movieResponse.json();

        // Load popular TV shows
        const tvResponse = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "popular", type: "tv" }),
        });

        if (tvResponse.ok) {
          const tvData = await tvResponse.json();

          const combinedContent = [
            ...movieData.results.map((item) => ({
              ...item,
              category: "movies",
            })),
            ...tvData.results.map((item) => ({ ...item, category: "series" })),
          ];

          setMovies(combinedContent);
        }
      }
    } catch (error) {
      console.error("Failed to load content:", error);
      setError("Failed to load content");
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), type: "multi" }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        setError("Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed");
    }
    setIsSearching(false);
  };

  const playMedia = (media) => {
    setCurrentMedia(media);
    setShowPlayer(true);
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentMedia(null);
  };

  // Handle remote control navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPlayer) {
        if (e.key === "Escape" || e.key === "Back") {
          e.preventDefault();
          closePlayer();
        }
        return;
      }

      if (showSearch) {
        if (e.key === "Escape" || e.key === "Back") {
          e.preventDefault();
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
          setFocusedItem(0);
        }
        return;
      }

      const currentMovies =
        searchResults.length > 0
          ? searchResults
          : movies.filter((movie) => movie.category === selectedCategory);

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setFocusedItem((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedItem((prev) =>
            Math.min(currentMovies.length - 1, prev + 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          if (searchResults.length === 0) {
            const categories = ["movies", "series", "documentaries"];
            const currentIndex = categories.indexOf(selectedCategory);
            if (currentIndex > 0) {
              setSelectedCategory(categories[currentIndex - 1]);
              setFocusedItem(0);
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (searchResults.length === 0) {
            const categories = ["movies", "series", "documentaries"];
            const currentIndex = categories.indexOf(selectedCategory);
            if (currentIndex < categories.length - 1) {
              setSelectedCategory(categories[currentIndex + 1]);
              setFocusedItem(0);
            }
          }
          break;
        case "Enter":
          e.preventDefault();
          if (currentMovies[focusedItem]) {
            playMedia(currentMovies[focusedItem]);
          }
          break;
        case "s":
        case "S":
          e.preventDefault();
          setShowSearch(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCategory,
    focusedItem,
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
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        Loading Skye Movie...
      </div>
    );
  }

  if (showPlayer && currentMedia) {
    const playerUrl =
      currentMedia.media_type === "movie"
        ? `https://mappletv.uk/watch/movie/${currentMedia.tmdb_id}`
        : `https://mappletv.uk/watch/tv/${currentMedia.tmdb_id}-1-1`;

    return (
      <div
        style={{
          backgroundColor: "#000",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          Press ESC or Back to return
        </div>
        <iframe
          src={playerUrl}
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
          }}
          allowFullScreen
          title={`Playing ${currentMedia.title}`}
        />
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
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "#4ecdc4",
            }}
          >
            SEARCH
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
              padding: "15px 20px",
              fontSize: "18px",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              border: "2px solid #4ecdc4",
              borderRadius: "8px",
              outline: "none",
            }}
          />
          <div
            style={{
              fontSize: "14px",
              opacity: 0.7,
            }}
          >
            ESC to close
          </div>
        </div>

        {isSearching && (
          <div
            style={{ textAlign: "center", fontSize: "18px", margin: "40px 0" }}
          >
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              paddingBottom: "20px",
            }}
          >
            {searchResults.map((media, index) => (
              <div
                key={media.id}
                style={{
                  minWidth: "200px",
                  textAlign: "center",
                  cursor: "pointer",
                  transform: focusedItem === index ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.3s ease",
                  border:
                    focusedItem === index
                      ? "3px solid #4ecdc4"
                      : "3px solid transparent",
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor:
                    focusedItem === index ? "#1a1a1a" : "transparent",
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
                  alt={media.title}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: focusedItem === index ? "#4ecdc4" : "#fff",
                    marginBottom: "5px",
                  }}
                >
                  {media.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    textTransform: "uppercase",
                  }}
                >
                  {media.media_type} {media.year && `(${media.year})`}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              margin: "40px 0",
              opacity: 0.7,
            }}
          >
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
          borderBottom: "2px solid #333",
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#4ecdc4",
          }}
        >
          SKYE MOVIE
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: "18px",
            opacity: 0.7,
          }}
        >
          ↑↓ Categories | ←→ Browse | Enter Play | S Search
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ff4444",
            color: "#fff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Category Navigation */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "30px",
        }}
      >
        {["movies", "series", "documentaries"].map((category) => (
          <div
            key={category}
            style={{
              padding: "12px 24px",
              fontSize: "20px",
              fontWeight: selectedCategory === category ? "bold" : "normal",
              color: selectedCategory === category ? "#4ecdc4" : "#fff",
              backgroundColor:
                selectedCategory === category ? "#1a1a1a" : "transparent",
              border:
                selectedCategory === category
                  ? "2px solid #4ecdc4"
                  : "2px solid transparent",
              borderRadius: "8px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedCategory(category);
              setFocusedItem(0);
            }}
          >
            {category}
          </div>
        ))}
      </div>

      {/* Movie Grid */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          paddingBottom: "20px",
        }}
      >
        {currentMovies.map((movie, index) => (
          <div
            key={movie.id}
            style={{
              minWidth: "200px",
              textAlign: "center",
              cursor: "pointer",
              transform: focusedItem === index ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.3s ease",
              border:
                focusedItem === index
                  ? "3px solid #4ecdc4"
                  : "3px solid transparent",
              borderRadius: "12px",
              padding: "10px",
              backgroundColor:
                focusedItem === index ? "#1a1a1a" : "transparent",
            }}
            onClick={() => {
              setFocusedItem(index);
              setTimeout(() => playMedia(movie), 100);
            }}
          >
            <img
              src={
                movie.poster_path ||
                "https://via.placeholder.com/300x450/333/fff?text=No+Image"
              }
              alt={movie.title}
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: focusedItem === index ? "#4ecdc4" : "#fff",
                marginBottom: "5px",
              }}
            >
              {movie.title}
            </div>
            {movie.vote_average && (
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                ⭐ {movie.vote_average.toFixed(1)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Instructions */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "40px",
          right: "40px",
          textAlign: "center",
          fontSize: "14px",
          opacity: 0.6,
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        Remote Control: ↑↓ Categories | ←→ Browse | Enter Play | S Search |
        Back/ESC Exit
      </div>
    </div>
  );
}

export default MainComponent;