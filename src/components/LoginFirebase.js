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

import {
  SignInWithAppleResponse,
  SignInWithAppleOptions
} from "@capacitor-community/apple-sign-in";
import { Plugins } from "@capacitor/core";

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

  const signInMobile = async (provider) => {
    if (provider === "apple.com") {
      let options: SignInWithAppleOptions = {
        clientId: "app.plasticpatrol.co.uk",
        redirectURI: "/",
        scopes: "email name"
      };

      try {
        /**
         * The displayName from the `capacitor-firebase-auth` plugin's apple sigin-in is always empty.
         * Here we change to use `@capacitor-community/apple-sign-in` plugin to get the available user info.
         * However it doesn't trigger onAuthStateChanged so we use signInWithCredential.
         */
        const result: SignInWithAppleResponse = await Plugins.SignInWithApple.authorize(
          options
        );
        const { identityToken, givenName, familyName } = result.response;

        /**
         * We also use updateProfile to update the displayName in firebase but it doesn't trigger onAuthStateChanged either.
         * Thus save displayName to local storage in order to set the correct displayName to currentUser.
         * Note that Apple sign-in only provides full response during the first successful sign in!!!
         * After that, familyName, givenName and email fields will be null.
         */
        const displayName =
          givenName && familyName
            ? `${givenName} ${familyName}`
            : givenName
            ? givenName
            : familyName;

        if (displayName) {
          localStorage.setItem("displayName", displayName);
        }

        const credential = await new firebase.auth.OAuthProvider(
          "apple.com"
        ).credential(identityToken);
        const authResult = await firebase
          .auth()
          .signInWithCredential(credential);

        if (displayName) {
          await authResult.user.updateProfile({ displayName: displayName });
        }
        handleClose();
      } catch (error) {
        console.log(error);
      }
    } else {
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
    }
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
