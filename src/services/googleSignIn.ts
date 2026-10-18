
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn(): void {
  GoogleSignin.configure({
    webClientId:
      'Y1087379121572-krau5b2fe25sssgkg8r9c2k42a38jk3m.apps.googleusercontent.com',
    offlineAccess: false,
  });
}

export async function signInWithGoogle(): Promise<string | null> {
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();

  if (response.type !== 'success') {
    return null;
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error(
      'Google did not return an ID token. Check the Web OAuth client ID configuration.',
    );
  }

  return idToken;
}
