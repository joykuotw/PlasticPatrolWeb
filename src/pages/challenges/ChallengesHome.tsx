import React, { useContext, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";

import PageWrapper from "components/PageWrapper";

import "react-circular-progressbar/dist/styles.css";

import styles from "standard.scss";
import Search from "@material-ui/icons/Search";
import ChallengeThumbnail from "./ChallengeThumbnail";
import { linkToCreateChallenge } from "../../routes/challenges/links";
import {
  ChallengesProviderData,
  useChallenges
} from "../../providers/ChallengesProvider";
import {
  Challenge,
  ChallengeFirestoreData,
  userIsInChallenge
} from "../../types/Challenges";
import { useUser } from "../../providers/UserProvider";
import User from "../../types/User";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexFlow: "column",
    padding: "5%"
  },

  searchWrapper: {
    flex: "0 0 auto",
    background: styles.lightGrey,
    width: "100%",
    margin: "0 0 20px 0",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    padding: `${theme.spacing(1)}px ${theme.spacing(1)}px`,
    boxSizing: "border-box",
    color: styles.darkgray,
    fontSize: 20
  },

  searchInput: {
    border: "none",
    background: styles.lightGrey,
    fontSize: 16,
    marginLeft: theme.spacing(1),
    boxSizing: "border-box",
    width: "100%",
    textOverflow: "ellipsis",
    "&:focus": {
      outline: "none"
    }
  },

  challengeList: {
    flex: "0 0 auto"
  }
}));

type Props = {};

function getFilteredChallenges(
  searchString: string,
  challenges: ChallengeFirestoreData[],
  user?: User
): ChallengeFirestoreData[] {
  const userLoggedIn = user !== undefined;
  const userId = user?.id || "invalid_id";

  // Put challenges that users are in at the top.
  if (userLoggedIn) {
    challenges.sort((a: ChallengeFirestoreData, b: ChallengeFirestoreData) => {
      return userIsInChallenge(a, userId) ? 1 : 0;
    });
  }

  // If user hasn't searched anything, return all public challenges and challenges user is part of.
  if (searchString === "") {
    return challenges.filter(
      (challenge) =>
        !challenge.isPrivate || userIsInChallenge(challenge, userId)
    );
  }

  const MIN_PRIVATE_CHALLENGE_ID_SEARCH_LENGTH = 6;

  const challengeNameIncludesSubstring = (name: string, substring: string) =>
    name.toLowerCase().includes(substring.toLowerCase());
  const searchedPrivateChallengeId = (
    challenge: Challenge,
    substring: string
  ) => {
    return (
      challenge.isPrivate &&
      substring.length > MIN_PRIVATE_CHALLENGE_ID_SEARCH_LENGTH &&
      challenge.id.includes(substring)
    );
  };

  // Filter based on search string.
  // If it's a public challenge, check if the name includes the search string.
  // If it's a private challenge, check user logged, and the search string matches a section of the challenge ID.
  challenges = challenges.filter((challenge) => {
    const searchedPublicChallenge =
      (!challenge.isPrivate || userIsInChallenge(challenge, userId || "")) &&
      challengeNameIncludesSubstring(challenge.name, searchString);
    const searchedPrivateChallenge =
      userLoggedIn &&
      challenge.isPrivate &&
      searchedPrivateChallengeId(challenge, searchString);
    return searchedPublicChallenge || searchedPrivateChallenge;
  });

  return challenges;
}

export default function ChallengesHome({}: Props) {
  const history = useHistory();
  const handleBack = () => history.goBack();

  const challengeData = useChallenges();
  const user = useUser();

  const classes = useStyles();
  const [searchString, setSearchString] = useState("");
  const filteredChallengeList = useMemo(
    () =>
      getFilteredChallenges(
        searchString,
        challengeData?.challenges || [],
        user
      ),
    [searchString, challengeData]
  );
  return (
    <PageWrapper
      label={"Challenges"}
      navigationHandler={{ handleBack }}
      className={classes.wrapper}
      addAction={() => history.push(linkToCreateChallenge())}
    >
      <div className={classes.searchWrapper}>
        <Search style={{ color: styles.darkgrey }} />
        <input
          placeholder={"Search"}
          className={classes.searchInput}
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />
      </div>
      <div className={classes.challengeList}>
        {filteredChallengeList.length === 0 ? (
          <div>
            Unfortunately, there are no matches for your search. <br />
            <br />
            If you’d like to create your own challenge, please tap on the create
            challenge button at the top of the screen.
          </div>
        ) : (
          filteredChallengeList.map((challenge: ChallengeFirestoreData) => (
            <ChallengeThumbnail key={challenge.id} challenge={challenge} />
          ))
        )}
      </div>
    </PageWrapper>
  );
}
