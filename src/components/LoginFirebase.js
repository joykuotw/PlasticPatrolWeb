import React from "react";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import withMobileDialog from "@material-ui/core/withMobileDialog";

import * as firebaseui from "firebaseui";
import firebase from "firebase/app";
import "firebase/auth";

import { authFirebase } from "features/firebase";

// TODO: change theme: https://github.com/firebase/firebaseui-web-react/tree/master/dist

const LoginFirebase = (props) => {
  const { open, handleClose, onSignIn } = props;

  const uiConfig = {
    signInSuccessUrl: "/",
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      "apple.com"
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (result) => {
        if (result.additionalUserInfo.isNewUser) {
          authFirebase.sendEmailVerification();
        }
        onSignIn && onSignIn();
        return false;
      },
      signInFailure: (error) => {
        console.log(error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <FirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </DialogContent>
    </Dialog>
  );
};

export default withMobileDialog()(LoginFirebase);
