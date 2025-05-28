import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should return an object with expected auth properties', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toHaveProperty('session');
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('profile');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('profileLoading');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('refreshSession');
    expect(result.current).toHaveProperty('updateProfile');
    expect(result.current).toHaveProperty('refreshProfile');
  });
});
