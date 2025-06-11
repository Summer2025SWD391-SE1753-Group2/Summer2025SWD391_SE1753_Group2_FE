import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, type: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('post');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchType);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2">
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="post">Post (Tag/Topic/Title)</option>
        <option value="account">Account (Username)</option>
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="p-2 border rounded w-full max-w-xs"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;