import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  HelpOutline,
  Close as CloseIcon,
} from "@material-ui/icons";


import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from '../../utils/formatSerializedId';
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    // padding: theme.spacing(1),
    padding: theme.padding,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
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
  connectionSelectionDialog: {
    '& .MuiDialog-paper': {
      maxWidth: '600px',
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
    },
  },
  connectionSelectionTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    padding: theme.spacing(2),
  },
  connectionSelectionContent: {
    padding: theme.spacing(3),
  },
  connectionDescription: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
  connectionOptions: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
  },
  connectionOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    width: '150px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-5px)',
    },
    '&.disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      '&:hover': {
        boxShadow: 'none',
        transform: 'none',
      },
    },
  },
  connectionIcon: {
    fontSize: '3rem',
    marginBottom: theme.spacing(1),
  },
  connectionName: {
    fontWeight: 'bold',
    marginTop: theme.spacing(1),
  },
}));

const CircularProgressWithLabel = (props) => {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366" }} />;
    default:
      return "error";
  }
};

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const history = useHistory();
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(confirmationModalInitialState);
  const [planConfig, setPlanConfig] = useState(false);
  const { handleLogout } = useContext(AuthContext);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  // Estado para controlar o modal de seleção de conexão
  const [connectionSelectionOpen, setConnectionSelectionOpen] = useState(false);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs)
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verificar se é a primeira visita à página
  useEffect(() => {
    const hasVisitedConnections = localStorage.getItem('hasVisitedConnections');
    if (!hasVisitedConnections) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedConnections', 'true');
    }
  }, []);

  var before = moment(moment().format()).isBefore(user.company.dueDate);

	if (before !== true){
		handleLogout();
	}

  const responseFacebook = (response) => {
    console.log("Facebook response:", response);
    if (response && response.accessToken) {
      const { accessToken, id } = response;
      console.log("Facebook login successful:", response);

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
          // Recarregar a página após o sucesso para mostrar a nova conexão
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          console.error("Facebook API error:", error);
          toastError(error);
        });
    } else {
      console.log("Facebook login failed or cancelled:", response);
      if (response && response.status === "unknown") {
        toast.error(i18n.t("connections.facebook.error"));
      }
    }
  };

  const responseInstagram = (response) => {
    console.log("Instagram response:", response);
    if (response && response.accessToken) {
      const { accessToken, id } = response;
      console.log("Instagram login successful:", response);

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
          // Recarregar a página após o sucesso para mostrar a nova conexão
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        })
        .catch((error) => {
          console.error("Instagram API error:", error);
          toastError(error);
        });
    } else {
      console.log("Instagram login failed or cancelled:", response);
      if (response && response.status === "unknown") {
        toast.error(i18n.t("connections.facebook.error"));
      }
    }
  };

  useEffect(() => {
    // const socket = socketManager.GetSocket();

    socket.on(`importMessages-${user.companyId}`, (data) => {
      if (data.action === "refresh") {
        setStatusImport([]);
        history.go(0);
      }
      if (data.action === "update") {
        setStatusImport(data.status);
      }
    });

    /* return () => {
      socket.disconnect();
    }; */
  }, [whatsApps]);

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleCloseQrcodeModal = () => {
    setQrModalOpen(false);
  };

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const openInNewTab = url => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };


  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          style={{ marginLeft: 12 }}
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <>
              <Button
                disabled
                style={{ marginLeft: 12 }}
                size="small"
                endIcon={
                  <CircularProgress
                    size={12}
                    className={classes.buttonProgress}
                  />
                }
                variant="outlined"
                color="primary"
              >
                {i18n.t("connections.buttons.preparing")}
              </Button>
            </>
          );
        }
      }
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleOpenQrModal(whatsApp)}
              >
                {i18n.t("connections.buttons.qrcode")}
              </Button>
            )}
          />
        )}
        {whatsApp.status === "DISCONNECTED" && (
          <Can
            role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleStartWhatsAppSession(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.tryAgain")}
                </Button>{" "}
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleRequestNewQrCode(whatsApp.id)}
                >
                  {i18n.t("connections.buttons.newQr")}
                </Button>
              </>
            )}
          />
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
            <Can
              role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
              perform="connections-page:addConnection"
              yes={() => (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      handleOpenConfirmationModal("disconnect", whatsApp.id);
                    }}
                  >
                    {i18n.t("connections.buttons.disconnect")}
                  </Button>

                  {renderImportButton(whatsApp)}
                </>
              )}
            />
          )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const renderStatusToolTips = (whatsApp) => {
    return (
      <div className={classes.customTableCell}>
        {whatsApp.status === "DISCONNECTED" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.disconnected.title")}
            content={i18n.t("connections.toolTips.disconnected.content")}
          >
            <SignalCellularConnectedNoInternet0Bar color="secondary" />
          </CustomToolTip>
        )}
        {whatsApp.status === "OPENING" && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
        {whatsApp.status === "qrcode" && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.qrcode.title")}
            content={i18n.t("connections.toolTips.qrcode.content")}
          >
            <CropFree />
          </CustomToolTip>
        )}
        {whatsApp.status === "CONNECTED" && (
          <CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
            <SignalCellular4Bar style={{ color: green[500] }} />
          </CustomToolTip>
        )}
        {(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
          <CustomToolTip
            title={i18n.t("connections.toolTips.timeout.title")}
            content={i18n.t("connections.toolTips.timeout.content")}
          >
            <SignalCellularConnectedNoInternet2Bar color="secondary" />
          </CustomToolTip>
        )}
      </div>
    );
  };

  const restartWhatsapps = async () => {

    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  }

  // Funções para controlar o modal de vídeo
  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  // Funções para controlar o modal de seleção de conexão
  const handleOpenConnectionSelection = () => {
    setConnectionSelectionOpen(true);
  };

  const handleCloseConnectionSelection = () => {
    setConnectionSelectionOpen(false);
  };

  // Funções para lidar com a seleção de cada tipo de conexão
  const handleWhatsAppSelection = () => {
    handleOpenWhatsAppModal();
    handleCloseConnectionSelection();
  };

  const handleFacebookSelection = () => {
    window.open(`https://www.facebook.com/v9.0/dialog/oauth?client_id=876917227970528&redirect_uri=${encodeURIComponent(window.location.href)}&scope=public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement&response_type=token`, "_blank");
    handleCloseConnectionSelection();
  };

  const handleInstagramSelection = () => {
    window.open(`https://www.facebook.com/v9.0/dialog/oauth?client_id=876917227970528&redirect_uri=${encodeURIComponent(window.location.href)}&scope=public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement&response_type=token`, "_blank");
    handleCloseConnectionSelection();
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
      {videoModalOpen && (
        <Dialog
          open={videoModalOpen}
          onClose={handleCloseVideoModal}
          className={classes.videoDialog}
        >
          <DialogTitle className={classes.dialogTitle}>
            <Typography variant="h6">
              Como Usar as Conexões
            </Typography>
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleCloseVideoModal}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className={classes.videoContainer}>
              <iframe
                className={classes.videoIframe}
                title="YouTube video player"
                src="https://www.youtube.com/embed/esgz-tWY_ZE"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {connectionSelectionOpen && (
        <Dialog
          open={connectionSelectionOpen}
          onClose={handleCloseConnectionSelection}
          className={classes.connectionSelectionDialog}
        >
          <DialogTitle className={classes.connectionSelectionTitle}>
            <Typography variant="h6">
              Selecione o tipo de conexão
            </Typography>
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleCloseConnectionSelection}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.connectionSelectionContent}>
            <div className={classes.connectionDescription}>
              <Typography variant="body1" gutterBottom>
                Escolha qual tipo de conexão deseja fazer para integrar com seu sistema de atendimento.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cada tipo de conexão permite integrar com diferentes plataformas de mensagens.
              </Typography>
            </div>
            <div className={classes.connectionOptions}>
              <div
                className={`${classes.connectionOption} ${!planConfig?.plan?.useWhatsapp ? 'disabled' : ''}`}
                onClick={planConfig?.plan?.useWhatsapp ? handleWhatsAppSelection : null}
                style={{ color: '#25D366' }}
              >
                <WhatsApp className={classes.connectionIcon} style={{ color: '#25D366' }} />
                <Typography className={classes.connectionName}>
                  WhatsApp
                </Typography>
                <Typography variant="caption" align="center">
                  Conecte números do WhatsApp
                </Typography>
              </div>
              
                  <FacebookLogin
                    appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                    autoLoad={false}
                    fields="name,email,picture"
                    version="23.0"
                    scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"
                    callback={responseFacebook}
                    render={(renderProps) => (
                      <MenuItem
                        disabled={planConfig?.plan?.useFacebook ? false : true}
                        onClick={renderProps.onClick}
                      >
                        <Facebook
                          fontSize="small"
                          style={{
                            marginRight: "10px",
                            color: "#3b5998",
                          }}
                        />
                        Facebook
                      </MenuItem>
                    )}
                  />
                  {/* INSTAGRAM */}
                  <FacebookLogin
                    appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                    autoLoad={false}
                    fields="name,email,picture"
                    version="23.0"
                    scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement"
                    callback={responseInstagram}
                    render={(renderProps) => (
                      <MenuItem
                        disabled={planConfig?.plan?.useInstagram ? false : true}
                        onClick={renderProps.onClick}
                      >
                        <Instagram
                          fontSize="small"
                          style={{
                            marginRight: "10px",
                            color: "#e1306c",
                          }}
                        />
                        Instagram
                      </MenuItem>
                    )}
                  />
              <div
                className={`${classes.connectionOption} ${!planConfig?.plan?.useFacebook ? 'disabled' : ''}`}
                onClick={planConfig?.plan?.useFacebook ? handleFacebookSelection : null}
                style={{ color: '#3b5998' }}
              >
                <Facebook className={classes.connectionIcon} style={{ color: '#3b5998' }} />
                <Typography className={classes.connectionName}>
                  Facebook
                </Typography>
                <Typography variant="caption" align="center">
                  Integre páginas do Facebook
                </Typography>
              </div>
              <div
                className={`${classes.connectionOption} ${!planConfig?.plan?.useInstagram ? 'disabled' : ''}`}
                onClick={planConfig?.plan?.useInstagram ? handleInstagramSelection : null}
                style={{ color: '#e1306c' }}
              >
                <Instagram className={classes.connectionIcon} style={{ color: '#e1306c' }} />
                <Typography className={classes.connectionName}>
                  Instagram
                </Typography>
                <Typography variant="caption" align="center">
                  Conecte contas do Instagram
                </Typography>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {user.profile === "user" && user.allowConnections === "disabled" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>{i18n.t("connections.title")} ({whatsApps.length})</Title>
            <MainHeaderButtonsWrapper>
              <Button
                variant="contained"
                color="primary"
                onClick={restartWhatsapps}
              >
                {i18n.t("connections.restartConnections")}
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(`https://wa.me/+555194556916`, "_blank")}
              >
                {i18n.t("connections.callSupport")}
              </Button>
              <Can
                role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                perform="connections-page:addConnection"
                yes={() => (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenConnectionSelection}
                  >
                    {i18n.t("connections.newConnection")}
                  </Button>
                )}
              />
            </MainHeaderButtonsWrapper>
          </MainHeader>

          {
            statusImport?.all ? (
              <>
                <div style={{ margin: "auto", marginBottom: 12 }}>
                  <Card className={classes.root}>
                    <CardContent className={classes.content}>
                      <Typography component="h5" variant="h5">

                        {statusImport?.this === -1 ? i18n.t("connections.buttons.preparing") : i18n.t("connections.buttons.importing")}

                      </Typography>
                      {statusImport?.this === -1 ?
                        <Typography component="h6" variant="h6" align="center">

                          <CircularProgress
                            size={24}
                          />

                        </Typography>
                        :
                        <>
                          <Typography component="h6" variant="h6" align="center">
                            {`${i18n.t(`connections.typography.processed`)} ${statusImport?.this} ${i18n.t(`connections.typography.in`)} ${statusImport?.all}  ${i18n.t(`connections.typography.date`)}: ${statusImport?.date} `}
                          </Typography>
                          <Typography align="center">
                            <CircularProgressWithLabel
                              style={{ margin: "auto" }}
                              value={(statusImport?.this / statusImport?.all) * 100}
                            />
                          </Typography>
                        </>
                      }
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null
          }

          <Paper className={classes.mainPaper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Channel</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.name")}</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.number")}</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.status")}</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.session")}</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.lastUpdate")}</TableCell>
                  <TableCell align="center">{i18n.t("connections.table.default")}</TableCell>
                  <Can
                    role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                    perform="connections-page:addConnection"
                    yes={() => (
                      <TableCell align="center">{i18n.t("connections.table.actions")}</TableCell>
                    )}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRowSkeleton />
                ) : (
                  <>
                    {whatsApps?.length > 0 &&
                      whatsApps.map((whatsApp) => (
                        <TableRow key={whatsApp.id}>
                          <TableCell align="center">{IconChannel(whatsApp.channel)}</TableCell>
                          <TableCell align="center">{whatsApp.name}</TableCell>
                          <TableCell align="center">{whatsApp.number && whatsApp.channel === 'whatsapp' ? (<>{formatSerializedId(whatsApp.number)}</>) : whatsApp.number}</TableCell>
                          <TableCell align="center">{renderStatusToolTips(whatsApp)}</TableCell>
                          <TableCell align="center">{renderActionButtons(whatsApp)}</TableCell>
                          <TableCell align="center">{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}</TableCell>
                          <TableCell align="center">
                            {whatsApp.isDefault && (
                              <div className={classes.customTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            )}
                          </TableCell>
                          <Can
                            role={user.profile}
                            perform="connections-page:addConnection"
                            yes={() => (
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditWhatsApp(whatsApp)}
                                >
                                  <Edit />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    handleOpenConfirmationModal("delete", whatsApp.id);
                                  }}
                                >
                                  <DeleteOutline />
                                </IconButton>
                              </TableCell>
                            )}
                          />
                        </TableRow>
                      ))}
                  </>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      }
      
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
    </MainContainer >

  );
};

export default Connections;