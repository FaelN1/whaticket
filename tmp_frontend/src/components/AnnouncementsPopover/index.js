import React, { useEffect, useReducer, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import AnnouncementIcon from "@material-ui/icons/Announcement";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  Paper,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import moment from "moment";
// import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 300,
    maxWidth: 500,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

function AnnouncementDialog({ announcement, open, handleClose }) {
  // const getMediaPath = (filename) => {
  //   return path.join(`${process.env.REACT_APP_BACKEND_URL}`,"public", "announcements",`${filename}`);
  // };
  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{announcement.title}</DialogTitle>
      <DialogContent>
        {announcement.mediaPath && (
          <div
            style={{
              border: "1px solid #f1f1f1",
              margin: "0 auto 20px",
              textAlign: "center",
              width: "95%",
              height: 300,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <img
              alt={`announcement image`}
              src={announcement.mediaPath}
              style={{
                width: "95%",
                height: "100%",
              }}
            />
          </div>
        )}
        <DialogContentText id="alert-dialog-description" style={{ whiteSpace: "pre-line" }}>
          {announcement.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} color="primary" autoFocus>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

export default function AnnouncementsPopover() {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [lastAnnouncementId, setLastAnnouncementId] = useState(localStorage.getItem('lastAnnouncementId') || 0);
//   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);


  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements().then(() => {
        // Verifica se há informativos não vistos
        if (announcements.length > 0) {
          const lastAnnouncement = announcements[0];
          if (lastAnnouncement.id > lastAnnouncementId) {
            setAnnouncement(lastAnnouncement);
            setShowAnnouncementDialog(true);
          }
        }
      });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.companyId) {
      const companyId = user.companyId;
//    const socket = socketManager.GetSocket();

      const onCompanyAnnouncement = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
          setInvisible(false);
          // Se for um novo informativo e não foi visto ainda
          if (data.record.id > lastAnnouncementId) {
            setAnnouncement(data.record);
            setShowAnnouncementDialog(true);
          }
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
        }
      };
      socket.on(`company-announcement`, onCompanyAnnouncement);

      return () => {
        socket.off(`company-announcement`, onCompanyAnnouncement);
      };
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const borderPriority = (priority) => {
    if (priority === 1) {
      return "4px solid #b81111";
    }
    if (priority === 2) {
      return "4px solid orange";
    }
    if (priority === 3) {
      return "4px solid grey";
    }
  };


  const handleShowAnnouncementDialog = (record) => {
    setAnnouncement(record);
    setShowAnnouncementDialog(true);
    setAnchorEl(null);
  };

  const handleCloseAnnouncementDialog = () => {
    setShowAnnouncementDialog(false);
    // Salva o ID do último informativo visto
    if (announcement.id) {
      localStorage.setItem('lastAnnouncementId', announcement.id);
      setLastAnnouncementId(announcement.id);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <AnnouncementDialog
        announcement={announcement}
        open={showAnnouncementDialog}
        handleClose={handleCloseAnnouncementDialog}
      />
      <IconButton
        variant="contained"
        aria-describedby={id}
        onClick={handleClick}
        style={{ color: "white" }}
      >
        <Badge
          color="secondary"
          variant="dot"
          invisible={invisible || announcements.length < 1}
        >
          <AnnouncementIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
        >
          <List
            component="nav"
            aria-label="main mailbox folders"
            style={{ minWidth: 300 }}
          >
            {isArray(announcements) &&
              announcements.map((item, key) => (
                <ListItem
                  key={key}
                  style={{
                    background: key % 2 === 0 ? "primary" : "secondary",
                    border: "1px solid #eee",
                    borderLeft: borderPriority(item.priority),
                    cursor: "pointer",
                  }}
                  onClick={() => handleShowAnnouncementDialog(item)}
                >
                  {item.mediaPath && (
                    <ListItemAvatar>
                      <Avatar
                        src={item.mediaPath}
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography component="span" style={{ fontSize: 12 }}>
                          {moment(item.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                        <span style={{ marginTop: 5, display: "block" }}></span>
                        <Typography component="span" variant="body2">
                          {item.text}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            {isArray(announcements) && announcements.length === 0 && (
              <ListItemText primary={i18n.t("mainDrawer.appBar.notRegister")} />
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}