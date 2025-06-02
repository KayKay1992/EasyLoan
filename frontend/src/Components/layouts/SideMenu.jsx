import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_SIDEBAR, USER_SIDEBAR } from '../../utils/data';
import axiosInstance from '../../utils/axiosInstance';

const SideMenu = ({ activeMenu, isMobile = false }) => {
  const { user, clearUser } = useContext(UserContext);
  const [SideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const sanitizeImageUrl = (url) => {
    console.log('Original URL:', url);
    if (!url) return '';
    const baseUrl = axiosInstance.defaults.baseURL || 'https://easyloan.onrender.com';
    let sanitized = url;
    const patterns = [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://easyloan-1.onrender.com'
    ];
    patterns.forEach(pattern => {
      sanitized = sanitized.replaceAll(pattern, baseUrl);
    });
    console.log('Sanitized URL:', sanitized);
    return sanitized;
  };

  const handleClick = (route) => {
    if (route === 'logout') {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(user?.role === 'admin' ? ADMIN_SIDEBAR : USER_SIDEBAR);
    }
  }, [user]);

  return (
    <div className={`${isMobile ? 'block' : 'hidden sm:block'} w-full h-full bg-yellow-800 overflow-y-auto`}>
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">
          <img 
            src={user?.profileImageUrl ? sanitizeImageUrl(user.profileImageUrl) : 'https://via.placeholder.com/80'} 
            alt='profile' 
            className='w-20 h-20 bg-slate-400 rounded-full'
            onError={() => console.error('Failed to load profile image')}
          />
        </div>
        {user?.role === 'admin' && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}
        <h5 className="text-gray-950 font-medium leading-6 mt-3">
          {user?.name || ''}
        </h5>
        <p className="text-[12px] text-gray-300">
          {user?.email || ''}
        </p>
        <button
          onClick={() => navigate("/profile-update")}
          className="text-amber-400 hover:text-white border border-amber-700 hover:bg-amber-900 px-3 py-1 rounded-md text-sm mt-5"
        >
          Update Profile
        </button>
      </div>

      {SideMenuData.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu === item.label 
              ? "text-primary bg-blue-50/40 border-r-4 border-blue-500" 
              : "text-gray-200 hover:bg-amber-900"
          } py-3 px-6 mb-3 cursor-pointer`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className='text-xl'/>
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;