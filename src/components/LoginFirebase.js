import React, { useState } from "react";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import withMobileDialog from "@material-ui/core/withMobileDialog";

import * as firebaseui from "firebaseui";
import firebase from "firebase/app";
import "firebase/auth";
import { sendEmailVerification } from "../features/firebase/authFirebase";

import facebookIcon from "../assets/images/facebook.svg";
import emailIcon from "../assets/images/mail.svg";
import appleIcon from "../assets/images/apple.svg";
import { createButton } from "react-social-login-buttons";
import { cfaSignIn } from "capacitor-firebase-auth/alternative";

const FacebookLoginButton = createButton({
  text: "Sign in with Facebook",
  icon: () => <img src={facebookIcon} alt="email" />,
  style: { background: "#3b5998", marginBottom: "15px" }
});

const EmailLoginButton = createButton({
  text: "Sign in with email",
  icon: () => <img src={emailIcon} alt="email" />,
  style: { background: "#db4437", marginBottom: "15px" }
});

const AppleLoginButton = createButton({
  text: "Sign in with Apple",
  icon: () => <img src={appleIcon} alt="apple" />,
  style: { background: "#000000", marginBottom: "15px" }
});

const LoginFirebase = (props) => {
  const { open, handleClose, onSignIn } = props;
  const [isMobileEmailBtnOn, setIsMobileEmailBtnOn] = useState(false);

  const uiConfig = {
    signInSuccessUrl: "/",
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: isMobileEmailBtnOn
      ? [firebase.auth.EmailAuthProvider.PROVIDER_ID]
      : [
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          "apple.com"
        ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (result) => {
        if (result.additionalUserInfo.isNewUser) {
          sendEmailVerification();
        }
        onSignIn && onSignIn();
        return false;
      },
      signInFailure: (error) => {
        console.log(error);
      }
    }
  };

  const signInMobile = (provider) => {
    cfaSignIn(provider).subscribe(
      ({
        userCredential
      }: {
        userCredential: firebase.auth.UserCredential
      }) => {
        if (userCredential.additionalUserInfo.isNewUser) {
          sendEmailVerification();
        }
        handleClose();
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        {window.Capacitor.platform === "web" || isMobileEmailBtnOn ? (
          <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
        ) : (
          <>
            <FacebookLoginButton onClick={() => signInMobile("facebook.com")} />
            <EmailLoginButton onClick={() => setIsMobileEmailBtnOn(true)} />
            {window.Capacitor.platform === "android" ? null : (
              <AppleLoginButton onClick={() => signInMobile("apple.com")} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withMobileDialog()(LoginFirebase);
