import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { apiClient, APIError } from "~/lib/api-client";
import { Button } from "~/components/ui/Button";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Video Editor - Login" },
    { name: "description", content: "Sign in to your AI Video Editor account" },
  ];
};

interface ActionData {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already authenticated
  const token = new URL(request.url).searchParams.get('token');
  if (token) {
    try {
      apiClient.setToken(token);
      await apiClient.getCurrentUser();
      return redirect('/editor');
    } catch {
      // Invalid token, continue to login
    }
  }
  
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validation
  const fieldErrors: ActionData['fieldErrors'] = {};
  
  if (!email || !email.includes('@')) {
    fieldErrors.email = 'Please enter a valid email address';
  }
  
  if (!password || password.length < 6) {
    fieldErrors.password = 'Password must be at least 6 characters';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  try {
    if (actionType === 'login') {
      const tokenResponse = await apiClient.login(email, password);
      
      // Redirect to editor with token
      return redirect(`/editor?token=${encodeURIComponent(tokenResponse.access_token)}`);
      
    } else if (actionType === 'register') {
      await apiClient.register(email, password);
      
      // Auto-login after registration
      const tokenResponse = await apiClient.login(email, password);
      return redirect(`/editor?token=${encodeURIComponent(tokenResponse.access_token)}`);
    }

    return json<ActionData>({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof APIError) {
      if (error.status === 401) {
        return json<ActionData>({ error: 'Invalid email or password' }, { status: 400 });
      } else if (error.status === 400 && error.message.includes('already registered')) {
        return json<ActionData>({ error: 'Email is already registered. Please sign in instead.' }, { status: 400 });
      }
    }
    
    return json<ActionData>({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}

export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const isSubmitting = navigation.state === 'submitting';
  const isLoggingIn = isSubmitting && navigation.formData?.get('actionType') === 'login';
  const isRegisteringSubmit = isSubmitting && navigation.formData?.get('actionType') === 'register';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-50">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-400">
            {isRegistering 
              ? 'Sign up to start creating amazing videos' 
              : 'Sign in to your AI Video Editor account'
            }
          </p>
        </div>

        {/* Form */}
        <Form method="post" className="space-y-6">
          <input 
            type="hidden" 
            name="actionType" 
            value={isRegistering ? 'register' : 'login'} 
          />
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
            {actionData?.fieldErrors?.email && (
              <p className="mt-2 text-sm text-red-400">{actionData.fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
            {actionData?.fieldErrors?.password && (
              <p className="mt-2 text-sm text-red-400">{actionData.fieldErrors.password}</p>
            )}
          </div>

          {/* Error Message */}
          {actionData?.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{actionData.error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={isSubmitting}
          >
            {isLoggingIn && 'Signing In...'}
            {isRegisteringSubmit && 'Creating Account...'}
            {!isSubmitting && (isRegistering ? 'Create Account' : 'Sign In')}
          </Button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              disabled={isSubmitting}
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </Form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}