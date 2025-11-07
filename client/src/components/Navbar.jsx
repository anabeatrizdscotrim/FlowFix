import React, { useEffect, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import NotificationPanel from "./NotificationPanel";
import UserAvatar from "./UserAvatar";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { updateURL } from "../utils";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [displayTerm, setDisplayTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");  

  const traducoes = {
    alta: "high",
    média: "medium",
    media: "medium",
    baixa: "low",
    concluída: "completed",
    concluida: "completed",
    pendente: "pending",
    urgente: "urgent",
  };

  useEffect(() => {
    const param = searchParams.get("search");
    if (param) {
      const inverso = Object.entries(traducoes).find(([pt, en]) => en === param);
      if (inverso) {
        setDisplayTerm(inverso[0]); 
      } else {
        setDisplayTerm(param);
      }
      setSearchTerm(param);
    }
  }, []);

  const handleSearchChange = (e) => {
    const input = e.target.value.toLowerCase();
    setDisplayTerm(input);

    const translated = traducoes[input] || input;
    setSearchTerm(translated);
  };

  useEffect(() => {
    updateURL({ searchTerm, navigate, location });
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  return (
    <div className='flex justify-between items-center bg-white dark:bg-[#1f1f1f] px-4 py-3 2xl:py-4 sticky z-10 top-0'>
      <div className='flex gap-4'>
        <div>
          <button
            onClick={() => dispatch(setOpenSidebar(true))}
            className='text-2xl text-gray-500 block md:hidden'
          >
            ☰
          </button>
        </div>

        {location?.pathname !== "/dashboard" && (
          <form
            onSubmit={handleSubmit}
            className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6] dark:bg-[#1c1c1c]'
          >
            <MdOutlineSearch className='text-gray-500 text-xl' />

            <input
              onChange={handleSearchChange}
              value={displayTerm}
              type='text'
              placeholder='Procurar...'
              className='flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800'
            />
          </form>
        )}
      </div>

      <div className='flex gap-2 items-center'>
        <NotificationPanel />
        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
