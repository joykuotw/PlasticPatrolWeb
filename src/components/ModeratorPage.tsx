import React, { useState } from "react";

import _ from "lodash";

import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";

import Photo from "types/Photo";
import PageWrapper from "./PageWrapper";
import CardComponent from "./CardComponent";
import "./ModeratorPage.scss";
import config from "../custom/config";
import User from "types/User";
import usePhotosToModerate from "hooks/usePhotosToModerate";
import { dbFirebase } from "features/firebase";
import ConfirmationDialog, { Confirmation } from "./common/ConfirmationDialog";
import { useMissions } from "../providers/MissionsProvider";

const placeholderImage = process.env.PUBLIC_URL + "/custom/images/logo.svg";

const useStyles = makeStyles(() => ({
  noPhotos: {
    opacity: ".5",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: "100%",
    alignItems: "center"
  }
}));

interface Props {
  user: User;
  label: string;
  handleClose: () => void;
}

const ModeratorPage = ({ user, label, handleClose }: Props) => {
  const styles = useStyles();
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);
  const [photoSelected, setPhotoSelected] = useState<Photo | undefined>();
  const [confirmation, setConfirmation] = useState<Confirmation | undefined>();
  const photos = usePhotosToModerate();
  const missions = useMissions();

  const closeZoomDialog = () => setZoomDialogOpen(false);
  const handlePhotoClick = (photoSelected: Photo) => {
    setZoomDialogOpen(true);
    setPhotoSelected(photoSelected);
  };

  if (photos.length === 0) {
    return (
      <PageWrapper label={label} navigationHandler={{ handleClose }}>
        <div className={styles.noPhotos}>No photos to moderate!</div>
      </PageWrapper>
    );
  }

  const reject = async (photo: Photo) => {
    await dbFirebase.writeModeration(photo.id, user.id, false);
    await missions?.refresh();
  };
  const approve = async (photo: Photo) => {
    await dbFirebase.writeModeration(photo.id, user.id, true);
    await missions?.refresh();
  };

  return (
    <PageWrapper label={label} navigationHandler={{ handleClose }}>
      <List dense={false}>
        {_.map(photos, (photo) => (
          <ListItem
            key={photo.id}
            button
            onClick={() => handlePhotoClick(photo)}
          >
            <ListItemAvatar>
              <Avatar
                imgProps={{
                  onError: (e) => {
                    // @ts-ignore
                    e.target.src = placeholderImage;
                  }
                }}
                src={photo.thumbnail}
              />
            </ListItemAvatar>
            <ListItemText
              primary={config.PHOTO_ZOOMED_FIELDS.updated(photo.updated)}
            />
            <ListItemSecondaryAction>
              <IconButton
                aria-label="Reject"
                edge={false}
                onClick={() => {
                  setConfirmation({
                    message: `Are you sure you want to unpublish the photo ?`,
                    onConfirmation: () => reject(photo)
                  });
                }}
              >
                <ThumbDownIcon />
              </IconButton>
              <IconButton
                aria-label="Approve"
                edge={false}
                onClick={() => {
                  setConfirmation({
                    message: `Are you sure you want to publish the photo ?`,
                    onConfirmation: () => approve(photo)
                  });
                }}
              >
                <ThumbUpIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <ConfirmationDialog
        confirmation={confirmation}
        setConfirmation={setConfirmation}
      />

      <Dialog open={zoomDialogOpen} onClose={closeZoomDialog}>
        <DialogContent>
          {photoSelected && (
            <>
              <div style={{ textAlign: "center" }}>
                <img
                  className={"main-image"}
                  onError={(e) => {
                    // @ts-ignore
                    e.target.src = placeholderImage;
                  }}
                  alt={photoSelected.id}
                  src={photoSelected.main}
                />
              </div>
              <CardComponent
                photoSelected={photoSelected}
                handleReject={() =>
                  setConfirmation({
                    message: `Are you sure you want to unpublish the photo ?`,
                    onConfirmation: () => reject(photoSelected)
                  })
                }
                handleApprove={() =>
                  setConfirmation({
                    message: `Are you sure you want to publish the photo ?`,
                    onConfirmation: () => approve(photoSelected)
                  })
                }
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

export default ModeratorPage;
