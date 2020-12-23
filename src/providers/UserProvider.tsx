import React, { useState, useContext, useEffect } from "react";
import User from "types/User";
import { gtagEvent } from "gtag";
import config from "custom/config";
import { useHistory } from "react-router-dom";
import useEffectOnMount from "hooks/useEffectOnMount";
import firebase from "firebase";
import _ from "lodash";
import { onAuthStateChanged } from "../features/firebase/authFirebase";

const UserContext = React.createContext<User | undefined>(undefined);

type Props = { children: React.ElementType };

export default function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User>();

  const history = useHistory();
  const onSignOut = () => {
    gtagEvent("Signed out", "User");

    history.push(config.PAGES.map.path);
    window.location.reload();
  };

  useEffect(() => {
    let firestoreUnsubscribe: () => void;
    const firebaseAuthUnsubscribe = firebase
      .auth()
      .onAuthStateChanged((firebaseUser: firebase.User | null) => {
        if (firebaseUser === null) {
          return;
        }

        const userRef = firebase
          .firestore()
          .collection("users")
          .doc(firebaseUser.uid);

        firestoreUnsubscribe = userRef.onSnapshot((data) => {
          // We should wait to grab the main user data from gravatar before doing listening for future changes.
          if (user === undefined) {
            return;
          }

          if (!data.exists) {
            console.warn(
              `Tried to fetch user ${firebaseUser.uid} from firestore but data didn't exist`
            );
            return;
          }

          const userFirebaseData = data.data() as Partial<User>;

          // Hack to avoid continuous re-renders.
          if (
            _.isEqual(user.missions, userFirebaseData.missions) &&
            user.isModerator == !!userFirebaseData.isModerator
          ) {
            return;
          }

          setUser({
            ...user,
            ...userFirebaseData
          });
        });
      });

    return () => {
      console.log(
        `UserProvider unmounted. Unsubscribing from Firebase. Stopped listening to user firestore ref.`
      );
      firebaseAuthUnsubscribe();
      firestoreUnsubscribe();
    }; // unsubscribe callback on unmount
  }, [user]);

  useEffectOnMount(() => {
    onAuthStateChanged({
      onSignOut,
      setUser
    });
  });

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
