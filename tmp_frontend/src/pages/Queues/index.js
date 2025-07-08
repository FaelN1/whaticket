import React, { useEffect, useReducer, useState, useContext } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Tooltip,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit, HelpOutline, Close as CloseIcon } from "@material-ui/icons";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoDialog: {
    '& .MuiDialog-paper': {
      maxWidth: '800px',
      width: '100%',
    },
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    padding: theme.spacing(2),
  },
  closeButton: {
    color: '#fff',
  },
  videoContainer: {
    position: 'relative',
    paddingBottom: '56.25%', /* 16:9 */
    height: 0,
    overflow: 'hidden',
    width: '100%',
  },
  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  helpFab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    zIndex: 1000,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const classes = useStyles();

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);
  const companyId = user.companyId;

  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  // Verificar se é a primeira visita à página
  useEffect(() => {
    const hasVisitedQueues = localStorage.getItem('hasVisitedQueues');
    if (!hasVisitedQueues) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedQueues', 'true');
    }
  }, []);

  useEffect(() => {

    const onQueueEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    };
    socket.on(`company-${companyId}-queue`, onQueueEvent);

    return () => {
      socket.off(`company-${companyId}-queue`, onQueueEvent);
    };
  }, [socket, companyId]);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("Queue deleted successfully!"));
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  // Funções para controlar o modal de vídeo
  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${
            selectedQueue.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {queueModalOpen && (
        <QueueModal
          open={queueModalOpen}
          onClose={handleCloseQueueModal}
          queueId={selectedQueue?.id}
          onEdit={(res) => {
            if (res) {
              setTimeout(() => {
                handleEditQueue(res)
              }, 500)
            }
          }}
        />
      )}
      {/* Modal de vídeo tutorial */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        className={classes.videoDialog}
        aria-labelledby="video-tutorial-dialog-title"
      >
        <div className={classes.dialogTitle}>
          <Typography variant="h6" id="video-tutorial-dialog-title">
            Como Usar as Filas
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleCloseVideoModal} 
            aria-label="close"
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <DialogContent>
          <div className={classes.videoContainer}>
            <iframe
              className={classes.videoIframe}
              src="https://www.youtube.com/embed/6GK93SkbmNk"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
      {user.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>{i18n.t("queues.title")} ({queues.length})</Title>
            <MainHeaderButtonsWrapper>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenQueueModal}
              >
                {i18n.t("queues.buttons.add")}
              </Button>
            </MainHeaderButtonsWrapper>
          </MainHeader>
          <Paper className={classes.mainPaper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    {i18n.t("queues.table.ID")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("queues.table.name")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("queues.table.color")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("queues.table.orderQueue")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("queues.table.greeting")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("queues.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  {queues.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell align="center">{queue.id}</TableCell>
                      <TableCell align="center">{queue.name}</TableCell>
                      <TableCell align="center">
                        <div className={classes.customTableCell}>
                          <span
                            style={{
                              backgroundColor: queue.color,
                              width: 60,
                              height: 20,
                              alignSelf: "center",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <div className={classes.customTableCell}>
                          <Typography
                            style={{ width: 300, align: "center" }}
                            noWrap
                            variant="body2"
                          >
                            {queue.orderQueue}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <div className={classes.customTableCell}>
                          <Typography
                            style={{ width: 300, align: "center" }}
                            noWrap
                            variant="body2"
                          >
                            {queue.greetingMessage}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQueue(queue)}
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedQueue(queue);
                            setConfirmModalOpen(true);
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={4} />}
                </>
              </TableBody>
            </Table>
          </Paper>
        </>}
      
      {/* Botão flutuante "Como Funciona" */}
      <Tooltip title="Como Funciona" placement="left">
        <Fab
          color="primary"
          aria-label="como funciona"
          className={classes.helpFab}
          onClick={handleOpenVideoModal}
        >
          <HelpOutline />
        </Fab>
      </Tooltip>
    </MainContainer>
  );
};

export default Queues;