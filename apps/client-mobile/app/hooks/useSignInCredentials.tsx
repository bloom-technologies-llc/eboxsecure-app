import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

type SignInContextType = {
  emailAddress: string;
  password: string;
  setEmailAddress: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
};

const SignInContext = createContext({} as SignInContextType);
export const useSignInCredentials = () => useContext(SignInContext);

export const SignInCredentialsProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const obj = React.useMemo(
    () => ({
      emailAddress,
      setEmailAddress,
      password,
      setPassword,
    }),
    [emailAddress, password, setEmailAddress, setPassword],
  );
  return (
    <SignInContext.Provider value={obj}>{children}</SignInContext.Provider>
  );
};
