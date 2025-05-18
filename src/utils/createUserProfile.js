import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const createUserProfile = async (user) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      createdAt: new Date(),
    });
  }
};
