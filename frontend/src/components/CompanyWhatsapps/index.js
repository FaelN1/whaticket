import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO, set } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Stack } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  TableRow,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Divider
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
  WhatsApp
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import api from "../../services/api";
import WhatsAppModalAdmin from "../../components/WhatsAppModalAdmin";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    borderRadius: "10px",
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
    ...theme.scrollbarStyles
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450
  },
  tooltipPopper: {
    textAlign: "center"
  },
  buttonProgress: {
    color: green[500]
  }
  ,
  TableHead: {
    backgroundColor: theme.palette.barraSuperior,//"#3d3d3d",
    color: "textSecondary",
    borderRadius: "5px"
  }
}));

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper
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
const WhatsAppModalCompany = ({
  open,
  onClose,
  whatsAppId,
  filteredWhatsapps,
  companyInfos
}) => {
  //console.log(filteredWhatsapps,"teste")
  //console.log(companyInfos,"testeeeee")
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const { list } = useCompanies();
  const [loadingComp, setLoadingComp] = useState(false);
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const responseFacebook = response => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken
        })
        .then(response => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch(error => {
          toastError(error);
        });
    }
  };
  const responseInstagram = response => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken
        })
        .then(response => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch(error => {
          toastError(error);
        });
    }
  };

  const handleStartWhatsAppSession = async whatsAppId => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async whatsAppId => {
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

  const handleOpenQrModal = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = whatsApp => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/admin/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.disconnected"));
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

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderStatusToolTips = whatsApp => {
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

  const renderActionButtons = whatsApp => {
    return (
      <>
        {whatsApp.status === "qrcode" && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleOpenQrModal(whatsApp)}
          >
            {i18n.t("connections.buttons.qrcode")}
          </Button>
        )}
        {whatsApp.status === "DISCONNECTED" && (
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
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
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
          )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  const IconChannel = channel => {
    switch (channel) {
      case "facebook":
        return <Facebook />;
      case "instagram":
        return <Instagram />;
      case "whatsapp":
        return <WhatsApp />;
      default:
        return "error";
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <MainContainer>
          <ConfirmationModal
            title={confirmModalInfo.title}
            open={confirmModalOpen}
            onClose={setConfirmModalOpen}
            onConfirm={handleSubmitConfirmationModal}
          >
            {confirmModalInfo.message}
          </ConfirmationModal>
          <QrcodeModal
            open={qrModalOpen}
            onClose={handleCloseQrModal}
            whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
          />
          <WhatsAppModalAdmin
            open={whatsAppModalOpen}
            onClose={handleCloseWhatsAppModal}
            whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
          />

          <Paper
            className={classes.mainPaper}
            style={{ overflow: "hidden" }}
            variant="outlined"
          >
            <MainHeader>
              <Stack>
                <Typography
                  variant="h5"
                  color="black"
                  style={{
                    fontWeight: "bold",
                    marginLeft: "10px",
                    marginTop: "10px"
                  }}
                  gutterBottom
                >
                  Conexões de: {companyInfos?.name}
                </Typography>
              </Stack>

              <MainHeaderButtonsWrapper>
                <PopupState variant="popover" popupId="demo-popup-menu">
                  {popupState => (
                    <React.Fragment>
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem
                          onClick={() => {
                            handleOpenWhatsAppModal();
                            popupState.close();
                          }}
                        >
                          <WhatsApp
                            fontSize="small"
                            style={{
                              marginRight: "10px"
                            }}
                          />
                          WhatsApp
                        </MenuItem>
                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="13.0"
                          scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagementnt,business_management"
                          callback={responseFacebook}
                          render={renderProps => (
                            <MenuItem onClick={renderProps.onClick}>
                              <Facebook
                                fontSize="small"
                                style={{
                                  marginRight: "10px"
                                }}
                              />
                              Facebook
                            </MenuItem>
                          )}
                        />

                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="13.0"
                          scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                          callback={responseInstagram}
                          render={renderProps => (
                            <MenuItem onClick={renderProps.onClick}>
                              <Instagram
                                fontSize="small"
                                style={{
                                  marginRight: "10px"
                                }}
                              />
                              Instagram
                            </MenuItem>
                          )}
                        />
                      </Menu>
                    </React.Fragment>
                  )}
                </PopupState>
              </MainHeaderButtonsWrapper>
            </MainHeader>
            <Stack
              style={{
                overflowY: "auto",
                padding: "20px",
                backgroundColor: "rgb(244 244 244 / 53%)",
                borderRadius: "5px",
                height: "93%"
              }}
            >
              <Paper>
                <Table size="small">
                  <TableHead
                    className={classes.TableHead}
                  >
                    <TableRow style={{ color: "#fff" }}>
                      <TableCell style={{ color: "#fff" }} align="center">
                        Channel
                      </TableCell>
                      <TableCell style={{ color: "#fff" }} align="center">
                        {i18n.t("connections.table.name")}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }} align="center">
                        {i18n.t("connections.table.status")}
                      </TableCell>
                      {user.profile === "admin" && (
                        <TableCell style={{ color: "#fff" }} align="center">
                          {i18n.t("connections.table.session")}
                        </TableCell>
                      )}
                      <TableCell style={{ color: "#fff" }} align="center">
                        {i18n.t("connections.table.lastUpdate")}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }} align="center">
                        {i18n.t("connections.table.default")}
                      </TableCell>
                      {user.profile === "admin" && (
                        <TableCell style={{ color: "#fff" }} align="center">
                          {i18n.t("connections.table.actions")}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRowSkeleton />
                    ) : (
                      <>
                        {filteredWhatsapps?.length > 0 &&
                          filteredWhatsapps.map(whatsApp => (
                            <TableRow key={whatsApp.id}>
                              <TableCell align="center">
                                {IconChannel(whatsApp.channel)}
                              </TableCell>
                              <TableCell align="center">
                                {whatsApp?.name}
                              </TableCell>
                              <TableCell align="center">
                                {renderStatusToolTips(whatsApp)}
                              </TableCell>
                              {user.profile === "admin" && (
                                <TableCell align="center">
                                  {renderActionButtons(whatsApp)}
                                </TableCell>
                              )}
                              <TableCell align="center">
                                {format(
                                  parseISO(whatsApp.updatedAt),
                                  "dd/MM/yy HH:mm"
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {whatsApp.isDefault && (
                                  <div className={classes.customTableCell}>
                                    <CheckCircle
                                      style={{ color: green[500] }}
                                    />
                                  </div>
                                )}
                              </TableCell>
                              {user.profile === "admin" && (
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditWhatsApp(whatsApp)}
                                  >
                                    <Edit />
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={e => {
                                      handleOpenConfirmationModal(
                                        "delete",
                                        whatsApp.id
                                      );
                                    }}
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Stack>
          </Paper>
        </MainContainer>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModalCompany);
