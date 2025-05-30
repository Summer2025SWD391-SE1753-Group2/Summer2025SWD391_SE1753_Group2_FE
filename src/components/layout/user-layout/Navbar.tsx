import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import MainMenu from "@/components/common/MainMenu";


const user = {
  name: "Hiệp",
  avatar: "https://i.pravatar.cc/40",
};

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="shadow-gray-200 shadow-xs w-full py-6 px-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between space-x-1">
        {/* Logo */}
        <Link to="/" className="hover:underline">
          <h2 className="font-bold text-xl text-rose-600">🍜 Food Forum</h2>
        </Link>

        {/* Search */}
        <Input
          type="text"
          placeholder="Tìm kiếm..."
          className="flex items-center bg-gray-100 shadow-md shadow-gray-200 w-[250px] md:w-[400px] lg:w-[650px] rounded-4xl border-0 hover:scale-x-105 transition-transform duration-200"
        />

        {/* Menu */}
        <MainMenu
          isLoggedIn={isLoggedIn}
          avatarUrl={user.avatar}
          onLogout={handleLogout}
        />

        {/* Toggle for dev testing */}
        <button
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="rainbow-flow rounded-3xl px-8 text-white absolute right-1 top-44 bg-rose-500"
        >
          Test login
        </button>
      </div>
    </div>
  );
}
