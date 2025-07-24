import React, { useState } from 'react'
import api from '../api';
import type { AxiosError } from 'axios';

interface Props {
  setToken: React.Dispatch<React.SetStateAction<string | null>>
}

export default function AdminPortal(
  { setToken }: Props
) {
  const [authMode, setAuthMode] = useState("login");
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const setAuthModeHandler = () => {
    if (authMode === "login") {
      setAuthMode("signup");
    } else {
      setAuthMode("login");
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (form.username === "" || form.password === "") {
      return setErrorMessage("Please fill in fields.")
    }
    try {
      const res = await api.post('/api/auth/' + authMode, form);
        const token = res.data.token;
        localStorage.setItem('token', token);
        // setMessage('Login successful');
        setToken(token);
    } catch (e: unknown) {
      const error = e as AxiosError;
      console.log(error);
      setErrorMessage('Error submission failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
        <h2 className="text-lg text-gray-700 mb-6">
          {authMode === "login" ? 'Login' : 'Sign Up'}
        </h2>
        <form className='my-2' onSubmit={handleSubmit}>
          <div>
            <input className='border-1 border-solid rounded-sm px-1' placeholder="Username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <input className='my-2 border-1 border-solid rounded-sm px-1' type="password" placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className='mt-2'>
            <button
              className='w-[80px] bg-blue-600 text-white py-1 px-2 rounded-2xl cursor-pointer transition hover:scale-110'
              type="submit">
              {authMode === "login" ? 'Enter' : 'Register'}
            </button>
          </div>
        </form>
        <p className='text-red-500'>{errorMessage}</p>
        <button
          onClick={setAuthModeHandler}
          className=" text-blue-600 hover:underline text-xs cursor-pointer"
        >
          {authMode === "login" ? 'Switch to Sign Up' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
}
