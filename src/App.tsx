import { useState } from 'react';
import AdminPortal from './components/AdminPortal';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  if (!token) {
    return (<AdminPortal setToken={setToken} />)
  }
  return (
    <div>
      <Header setToken={setToken} />
      <Dashboard token={token}/>
    </div>
  )
}
