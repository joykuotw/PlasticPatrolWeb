import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CachedIcon from "@material-ui/icons/Cached";
import { makeStyles } from "@material-ui/core/styles";

import PageWrapper from "components/PageWrapper";
import Logo from "components/common/Logo";

const useStyles = makeStyles((theme) => ({
  typography: {
    ...theme.mixins.gutters(),
    display: "flex",
    flexDirection: "column"
  },
  sponsorImage: {
    alignSelf: "center",
    marginBottom: theme.spacing(1)
  },
  reCache: {
    display: "block",
    textAlign: "center"
  },
  list: {
    paddingLeft: "inherit"
  },
  logo: {
    minHeight: "140px",
    margin: theme.spacing(2)
  }
}));

type Props = {
  reloadPhotos: () => void;
  handleClose: () => void;
  sponsorImage?: string;
};

export default function AboutPage({
  reloadPhotos,
  handleClose,
  sponsorImage
}: Props) {
  const classes = useStyles();
  return (
    <PageWrapper label={"About"} navigationHandler={{ handleClose }}>
      <Logo className={classes.logo} />
      <Typography variant={"subtitle1"} className={classes.typography}>
        The Planet Patrol app brings together people all over the world to make
        powerful and positive impacts on the planet.
        <br />
        <br />
        This is more than just litter picking. By collecting and recording
        litter you are helping to build the largest and most influential dataset
        about litter polluting the planet. Data collected is used to drive
        positive and impactful changes across industry and governments.
        <br />
        <br />
        Here’s just a few ways the litter recorded in the app helps our
        campaigning:
        <ul className={classes.list}>
          <li>
            Drives change across industry by building evidence that enables us
            to hold offending brands to account
          </li>
          <li>
            Shapes government policy and provides tangible solutions for system
            change
          </li>
          <li>
            Creates an annual litter report that breaks down litter collected to
            identify wider trends and patterns, helping to accelerate system
            change
          </li>
          <li>
            Provides solutions for local authorities to improve waste management
            infrastructure and implement measures to prevent littering
          </li>
        </ul>
        Using the app is simple: See it. Snap it. Map it.
        <br />
        <br />
        Every time you record a piece of litter it’s marked on our global map,
        leaderboard and your personal profile allowing you to track your
        contributions and that of the Planet Patrol community.
        <br />
        <br />
        Join thousands of people from more than 85 countries across the globe
        using the Planet Patrol app to help shape a litter-free future together.
        <br />
        <br />
        <img
          src={sponsorImage}
          className={classes.sponsorImage}
          alt="sponsor logo"
        />
        <span className={classes.reCache}>
          <Button
            onClick={reloadPhotos}
            color="primary"
            startIcon={<CachedIcon />}
          >
            Recache Photos
          </Button>
        </span>
        <br />
        Version {process.env.REACT_APP_VERSION}, build{" "}
        {process.env.REACT_APP_BUILD_NUMBER}
      </Typography>
    </PageWrapper>
  );
}
