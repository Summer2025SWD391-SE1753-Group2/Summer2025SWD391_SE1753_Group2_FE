import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from 'react';
import axiosInstance from "@/lib/axios";

export function GuestTopbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      let data;
      const response = await axiosInstance.get(`/api/v1/accounts/profiles/${encodeURIComponent(query)}`);
      data = response.data;
      setSuggestions([data]);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">
              🍜 Food Forum
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 relative">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm cách nấu món ăn, hay mẹo vẽ thói trang, v.v."
              className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <span className="text-xl">&times;</span>
              </button>
            )}
            {isLoading && <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500">Loading...</span>}
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
                {suggestions.map((item, index) => (
                  <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer">
                    {JSON.stringify(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/auth/register">
            <Button>Register</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}