import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Dialog, DialogContent, DialogTitle, Typography, Fab, Tooltip, IconButton } from "@material-ui/core";
import { HelpOutline, Close as CloseIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  iframe: {
    border: "none",
    //position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
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

const Typebot = () => {
  const classes = useStyles();
  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  useEffect(() => {
    // Verifica se é a primeira visita do usuário à página Typebot
    const hasVisitedTypebot = localStorage.getItem('hasVisitedTypebot');
    if (!hasVisitedTypebot) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedTypebot', 'true');
    }
  }, []);

  // Funções para controlar o modal de vídeo
  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  return (
    <>
      {/* Modal de vídeo tutorial */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        className={classes.videoDialog}
        aria-labelledby="video-tutorial-dialog-title"
      >
        <div className={classes.dialogTitle}>
          <Typography variant="h6" id="video-tutorial-dialog-title">
            Como Usar o Typebot
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
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      <div className={classes.iframe}>
        <iframe
          className={classes.iframe}
          src="https://builder.atendzappy.com.br/typebots"
        ></iframe>
      </div>

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
    </>
  );
};

export default Typebot;
