import { signIn } from "next-auth/react";

export const useSignIn = () => {
  const handleGoogleSignIn = async (callbackUrl = window.location.pathname) => {
    // Perform Google sign in
    const result = await signIn("google", {
      callbackUrl,
    });

    return result;
  };

  return {
    handleGoogleSignIn,
  };
};
