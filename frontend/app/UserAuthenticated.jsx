// app/auth.js
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { isAuthenticated } from './utils/Auth';

const UserAuthenticated = () => {
  const router = useRouter();

  useEffect(() => {
    const auth = async () => {
        const authValue = await isAuthenticated();
        if (!authValue) {
          router.replace('/LoginScreen');  
        }
    }
    auth();
  }, []);

  return null;
};

export default UserAuthenticated;
