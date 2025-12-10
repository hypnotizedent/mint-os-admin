/**
 * Authentication Integration Test
 * Run this to verify the auth system works end-to-end
 */

import { test, expect, vi, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

// Mock the API
global.fetch = vi.fn();

describe('Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('customer login flow', async () => {
    const mockResponse = {
      success: true,
      token: 'test-jwt-token',
      customer: {
        id: '1',
        documentId: 'doc-1',
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = vi.fn();

    render(
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    );

    const user = userEvent.setup();

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // Check localStorage
    expect(localStorage.getItem('auth_token')).toBe('test-jwt-token');
    expect(localStorage.getItem('user_type')).toBe('customer');
  });

  test('customer signup flow', async () => {
    const mockResponse = {
      success: true,
      token: 'test-jwt-token',
      customer: {
        id: '1',
        documentId: 'doc-1',
        email: 'newuser@example.com',
        name: 'New User',
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const onSuccess = vi.fn();

    render(
      <AuthProvider>
        <SignupForm onSuccess={onSuccess} />
      </AuthProvider>
    );

    const user = userEvent.setup();

    // Fill in the form
    await user.type(screen.getByLabelText(/full name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Wait for signup to complete
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // Check localStorage
    expect(localStorage.getItem('auth_token')).toBe('test-jwt-token');
    expect(localStorage.getItem('user_type')).toBe('customer');
  });

  test('login with invalid credentials shows error', async () => {
    const mockResponse = {
      success: false,
      error: 'Invalid email or password',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    // Should not store anything in localStorage
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
