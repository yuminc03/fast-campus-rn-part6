import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import _ from 'lodash';

import { Collections, User } from '../types';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [processingSignup, setProcessingSignup] = useState(false);
  const [processingSignin, setProcessingSignin] = useState(false);

  useEffect(() => {
    const unSubscribe = auth().onUserChanged(async fbUser => {
      if (fbUser != null) {
        // login
        setUser({
          userId: fbUser.uid,
          email: fbUser.email ?? '',
          name: fbUser.displayName ?? '',
          profileUrl: fbUser.photoURL ?? '',
        });
      } else {
        // logout
        setUser(null);
      }

      setInitialized(true);
    });
    return () => {
      unSubscribe();
    };
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setProcessingSignup(true);
      try {
        const { user: currentUser } =
          await auth().createUserWithEmailAndPassword(email, password);
        await currentUser.updateProfile({ displayName: name });
        await firestore()
          .collection(Collections.USERS)
          .doc(currentUser.uid)
          .set({
            userId: currentUser.uid,
            email,
            name,
          });
      } finally {
        setProcessingSignup(false);
      }
    },
    [],
  );

  const signin = useCallback(async (email: string, password: string) => {
    try {
      setProcessingSignin(true);
      await auth().signInWithEmailAndPassword(email, password);
    } finally {
      setProcessingSignin(false);
    }
  }, []);

  const updateProfileImage = useCallback(
    async (filePath: string) => {
      if (user == null) {
        throw new Error('user is undefined');
      }
      const fileName = _.last(filePath.split('/'));
      if (fileName == null) {
        throw new Error('filename is undefind');
      }

      const storageFilePath = `users/${user?.userId}/${fileName}`;
      await storage().ref(storageFilePath).putFile(filePath);
      // 업로드한 파일을 다운로드 가능한 URL
      const url = await storage().ref(storageFilePath).getDownloadURL();
      await auth().currentUser?.updateProfile({ photoURL: url });
      await firestore().collection(Collections.USERS).doc(user.userId).update({
        profileUrl: url,
      });
    },
    [user],
  );

  const value = useMemo(() => {
    return {
      initialized,
      user,
      signup,
      processingSignup,
      signin,
      processingSignin,
      updateProfileImage,
    };
  }, [
    initialized,
    processingSignin,
    processingSignup,
    signin,
    signup,
    updateProfileImage,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
