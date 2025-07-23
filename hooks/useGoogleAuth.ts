import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase/config";

export const useGoogleAuth = () => {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "876469848708-bap8841r9ruviv2ueihm29cif6pq48b9.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@rocketmedia.es/bridgea-app-2"
  });

  const signInWithGoogle = async () => {
    const result = await promptAsync();
    if (result?.type === "success") {
      const authentication = result.authentication;
      if (!authentication) return;

      const credential = GoogleAuthProvider.credential(null, authentication.accessToken);
      await signInWithCredential(auth, credential);
      router.replace("/welcome");
    }
  };

  return { signInWithGoogle };
};
