import React from 'react';

interface Props {
  setToken: React.Dispatch<React.SetStateAction<string | null>>
}

const Header = ({ setToken }: Props) => {
  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    window.location.href = '/';
  };

  return (
    <div className="w-full bg-gray-200 flex justify-end p-4">
      <button className='bg-red-500 text-white py-1 px-3 rounded-2xl text-sm cursor-pointer'
        onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  );
};


export default Header;
