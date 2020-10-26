import React, { useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";

import PageWrapper from "components/PageWrapper";
import { Challenge } from "../../types/Challenges";

import "react-circular-progressbar/dist/styles.css";

import styles from "standard.scss";
import Search from "@material-ui/icons/Search";
import ChallengeThumbnail from "./ChallengeThumbnail";
import { linkToCreateChallenge } from "../../routes/challenges/links";

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

type Props = {
  challenges: Challenge[];
};

function getFilteredChallenges(
  searchPrefix: string,
  challenges: Challenge[]
): Challenge[] {
  if (searchPrefix === "") {
    return challenges;
  }

  return challenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchPrefix.toLowerCase())
  );
}

export default function ChallengesHome({ challenges }: Props) {
  const history = useHistory();
  const handleBack = () => history.goBack();

  const classes = useStyles();
  const [searchSubstring, setSearchSubstring] = useState("");
  const filteredChallengeList = useMemo(
    () => getFilteredChallenges(searchSubstring, challenges),
    [searchSubstring, challenges]
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
          value={searchSubstring}
          onChange={(e) => setSearchSubstring(e.target.value)}
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
          filteredChallengeList.map((challenge: Challenge) => (
            <ChallengeThumbnail challenge={challenge} />
          ))
        )}
      </div>
    </PageWrapper>
  );
}
