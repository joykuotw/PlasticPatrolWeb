import React from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { tAndCLink, privatePolicyLink } from "static/info";

import DrawerContainerItem from "components/DrawerContainerItem";
import { isIphoneWithNotchAndCordova, isIphoneAndCordova } from "utils";
import User from "types/User";
import Page from "types/Page";
import config from "custom/config";
import { useStats } from "providers/StatsProvider";

const drawerWidth = "80%";
const drawerMaxWidth = 360;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: drawerWidth,
    maxWidth: drawerMaxWidth
  },
  stats: {
    bottom: theme.spacing(5)
  },
  links: {
    paddingBottom: theme.spacing(1),
    fontSize: "12px"
  },
  sponsoredByContainer: {
    height: "25px",
    width: "100%",
    display: "block",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  },
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  info: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

const PAGES = config.PAGES;

type Props = {
  user: User | undefined;
  online: boolean;
  leftDrawerOpen: boolean;
  sponsorImage: string;
  toggleLeftDrawer: (open: boolean) => () => void;
  handleClickLoginLogout: () => void;
};

export default function DrawerContainer({
  user,
  online,
  leftDrawerOpen,
  sponsorImage,
  toggleLeftDrawer,
  handleClickLoginLogout
}: Props) {
  const theme = useTheme();
  const classes = useStyles();
  const stats = useStats();
  // these list items are only rendered when there is a user
  const listItemsTop: Page[] = [PAGES.account, PAGES.moderator];
  const listItemsTopUnderBreak: Page[] = [
    PAGES.feedbackReports,
    PAGES.leaderboard,
    PAGES.cleanUps
  ]
    .concat(config.ENABLE_GROUPS ? [PAGES.groups] : [])
    .concat(config.ENABLE_MISSIONS ? [PAGES.missions] : []);
  const listItemsBottom: Page[] = [
    PAGES.tutorial,
    PAGES.about,
    PAGES.writeFeedback
  ];
  return (
    <Drawer
      className="geovation-drawercontainer"
      open={leftDrawerOpen}
      onClose={toggleLeftDrawer(false)}
      classes={{ paper: classes.drawerPaper }}
    >
      <div
        style={{
          paddingTop: isIphoneWithNotchAndCordova()
            ? "env(safe-area-inset-top)"
            : isIphoneAndCordova
            ? theme.spacing(1.5)
            : undefined
        }}
      />
      <div
        tabIndex={0}
        role="button"
        onClick={toggleLeftDrawer(false)}
        className={classes.container}
      >
        <div>
          <List>
            {!!user && (
              <>
                {listItemsTop.map((item, idx) => (
                  <DrawerContainerItem
                    user={user}
                    online={online}
                    item={item}
                    key={idx}
                  />
                ))}
                <Divider />
              </>
            )}
            {listItemsTopUnderBreak.map((item, idx) => (
              <DrawerContainerItem
                user={user}
                online={online}
                item={item}
                key={idx}
              />
            ))}
            <Divider />
          </List>
        </div>
        <div>
          <List>
            {listItemsBottom.map((item, idx) => (
              <DrawerContainerItem
                key={idx}
                user={user}
                online={online}
                item={item}
              />
            ))}
            {online && (
              <ListItem button onClick={handleClickLoginLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary={user ? "Logout" : "Login"} />
              </ListItem>
            )}
          </List>
          <div className={classes.info}>
            <Typography className={classes.stats} color={"primary"}>
              {`${stats.pieces} pieces found so far!`}
            </Typography>
            {sponsorImage && (
              <span
                className={classes.sponsoredByContainer}
                style={{ backgroundImage: "url(" + sponsorImage + ")" }}
                data-test="SponsorLogo"
              />
            )}

            <Typography className={classes.links}>
              <a href={tAndCLink}>Terms and Conditions</a>
              {" / "}
              <a href={privatePolicyLink}>Privacy Policy</a>
            </Typography>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
