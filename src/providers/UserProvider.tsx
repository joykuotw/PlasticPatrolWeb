import React, { useState, useContext } from "react";
import { authFirebase } from "features/firebase";
import User from "types/User";
import { gtagEvent } from "gtag";
import config from "custom/config";
import { useHistory } from "react-router-dom";
import useEffectOnMount from "hooks/useEffectOnMount";

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

  useEffectOnMount(() => {
    authFirebase.onAuthStateChanged({
      onSignOut,
      setUser
    });
  });

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
