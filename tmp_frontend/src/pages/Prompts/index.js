import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "socket.io-client";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Fab,
  Tooltip,
  CircularProgress
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { HelpOutline, Close as CloseIcon, PlayArrow } from "@material-ui/icons";
import { Refresh as RefreshIcon } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import PromptModal from "../../components/PromptModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
// import { SocketContext } from "../../context/Socket/SocketContext";

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
  },
  videoLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const classes = useStyles();

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const { getPlanCompany } = usePlans();
  const history = useHistory();
  const companyId = user.companyId;

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasVisitedPrompts = localStorage.getItem('hasVisitedPrompts');
    if (!hasVisitedPrompts) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedPrompts', 'true');
    }
  }, []);

  useEffect(() => {
    if (videoModalOpen) {
      const timer = setTimeout(() => {
        setIframeLoaded(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIframeLoaded(false);
    }
  }, [videoModalOpen]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
      } catch (err) {
        console.error("Erro ao carregar prompts", err);
        setError(err.message || "Erro ao carregar dados");
        toastError(err);
        setLoading(false);
      } finally {
        setLoading(false)
      }
    })();
  }, []);

  useEffect(() => {
    const onPromptEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });

        // Se a flag forceRefresh estiver presente, força uma nova consulta ao backend
        if (data.forceRefresh) {
          (async () => {
            try {
              const { data: refreshedData } = await api.get(`/prompt/${data.prompt.id}`);
              dispatch({ type: "UPDATE_PROMPTS", payload: refreshedData });
            } catch (err) {
              console.error("Erro ao atualizar prompt após atualização forçada:", err);
            }
          })();
        }
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    };

    socket.on(`company-${companyId}-prompt`, onPromptEvent);
    return () => {
      socket.off(`company-${companyId}-prompt`, onPromptEvent);
    };
  }, [socket]);

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t(data.message));
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
  };

  // Funções para controlar o modal de vídeo
  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  const handleRefreshPromptApi = async (promptId) => {
    try {
      toast.info("Atualizando dados da API externa...", {
        autoClose: false,
        toastId: `refreshing-${promptId}`
      });

      const { data } = await api.post(`/prompt/${promptId}/refresh-api`);

      toast.dismiss(`refreshing-${promptId}`);

      toast.success("Dados da API atualizados com sucesso!");

      if (data.prompt) {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }
    } catch (err) {
      toast.dismiss(`refreshing-${promptId}`);

      toast.error(`Erro ao atualizar API: ${err.response?.data?.message || err.message}`);
      console.error("Erro ao atualizar API externa:", err);
    }
  };

  return (
    error ? (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Erro ao carregar a página: {error}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: 16 }}
        >
          Tentar Novamente
        </Button>
      </div>
    ) : (
      <MainContainer>
        <Dialog
          open={videoModalOpen}
          onClose={handleCloseVideoModal}
          className={classes.videoDialog}
          aria-labelledby="video-tutorial-dialog-title"
        >
          <div className={classes.dialogTitle}>
            <Typography variant="h6" id="video-tutorial-dialog-title">
              Como Usar os Prompts de IA
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
              {iframeLoaded ? (
                <iframe
                  className={classes.videoIframe}
                  src="https://www.youtube.com/embed/SqKyJJkLED8"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={classes.videoLoading}>
                  <CircularProgress />
                  <Typography variant="body2" style={{ marginTop: 10 }}>
                    Carregando vídeo...
                  </Typography>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <ConfirmationModal
          title={
            selectedPrompt &&
            `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
          }
          open={confirmModalOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
        >
          {i18n.t("prompts.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        <PromptModal
          open={promptModalOpen}
          onClose={handleClosePromptModal}
          promptId={selectedPrompt?.id}
        />

        {user.profile === "user" ? (
          <ForbiddenPage />
        ) : (
          <>
            <MainHeader>
              <Title>{i18n.t("prompts.title")}</Title>
              <MainHeaderButtonsWrapper>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenPromptModal}
                >
                  {i18n.t("prompts.buttons.add")}
                </Button>
              </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">
                      {i18n.t("prompts.table.name")}
                    </TableCell>
                    <TableCell align="left">
                      {i18n.t("prompts.table.queue")}
                    </TableCell>
                    <TableCell align="left">
                      {i18n.t("prompts.table.max_tokens")}
                    </TableCell>
                    <TableCell align="left">
                      Atualizar Dados
                    </TableCell>
                    <TableCell align="center">
                      {i18n.t("prompts.table.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {prompts.map((prompt) => {
                      // Verificação de segurança para evitar erros
                      if (!prompt || !prompt.id) return null;

                      return (
                        <TableRow key={prompt.id}>
                          <TableCell align="left">{prompt.name || '-'}</TableCell>
                          <TableCell align="left">{prompt.queue?.name || '-'}</TableCell>
                          <TableCell align="left">{prompt.maxTokens || '-'}</TableCell>
                          <TableCell align="center">
                            {prompt.prompt && prompt.prompt.includes("[API_URL:") && (
                              <IconButton
                                size="small"
                                onClick={() => handleRefreshPromptApi(prompt.id)}
                                title="Atualizar dados da API externa"
                                style={{ color: '#2196F3' }} // Azul para destacar
                              >
                                <RefreshIcon />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditPrompt(prompt)}
                            >
                              <Edit />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedPrompt(prompt);
                                setConfirmModalOpen(true);
                              }}
                            >
                              <DeleteOutline />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {loading && <TableRowSkeleton columns={4} />}
                  </>
                </TableBody>
              </Table>
            </Paper>
          </>
        )}

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
    )
  );
};
export default Prompts;
