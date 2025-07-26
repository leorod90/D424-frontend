import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';

// mock the api module
vi.mock('../api', () => ({
  default: {
    post: vi.fn()
  }
}));

// mock alert
global.alert = vi.fn();

describe('handleSubmit function tests', () => {
  let setErrorMessage;
  let setToken;
  let form;
  let authMode;

  beforeEach(() => {
    setErrorMessage = vi.fn();
    setToken = vi.fn();
    form = { username: '', password: '' };
    authMode = 'signup';
    vi.clearAllMocks();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.username === "" || form.password === "") {
      return setErrorMessage("Please fill in fields.")
    }
    try {
      const res = await api.post('/api/auth/' + authMode, form);
      if (authMode==="signup") {
        alert("Admin created please login!")
      } else {
        const token = res.data.token;
        localStorage.setItem('token', token);
        setToken(token);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage('Error submission failed.');
    }
  };

  it('should show error when password is missing', async () => {
    form.username = 'testuser';
    form.password = '';
    
    const mockEvent = { preventDefault: vi.fn() };
    await handleSubmit(mockEvent);
    
    expect(setErrorMessage).toHaveBeenCalledWith("Please fill in fields."); 
  });

  it('should successfully signup with valid credentials', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    
    form.username = 'testuser';
    form.password = 'testpass';
    
    const mockEvent = { preventDefault: vi.fn() };
    await handleSubmit(mockEvent);
    
    expect(api.post).toHaveBeenCalledWith('/api/auth/signup', {
      username: 'testuser',
      password: 'testpass'
    });
    expect(global.alert).toHaveBeenCalledWith('Admin created please login!');
  });
});