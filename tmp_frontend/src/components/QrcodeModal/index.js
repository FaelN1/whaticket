import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import { Dialog, DialogContent, Paper, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(4),
    padding: theme.spacing(2),
  },
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  instructions: {
    maxWidth: 300,
    textAlign: "left",
    '& ol': {
      paddingLeft: theme.spacing(3),
      margin: 0,
      '& li': {
        marginBottom: theme.spacing(1),
      },
    },
  },
  gifContainer: {
    marginTop: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    maxWidth: 250,
  },
  gif: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
}))

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const [qrCode, setQrCode] = useState("");
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = user.companyId;
    // const socket = socketConnection({ companyId, userId: user.id });

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    }
    socket.on(`company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      socket.off(`company-${companyId}-whatsappSession`, onWhatsappData);
    };
  }, [whatsAppId, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
        <Paper elevation={0}>
          <Typography color="secondary" gutterBottom>
            {i18n.t("qrCode.message")}
          </Typography>
          <div className={classes.root}>
            <div className={classes.qrContainer}>
              {qrCode ? (
                <QRCode 
                  value={qrCode} 
                  size={250} 
                  style={{ 
                    backgroundColor: "white", 
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }} 
                />
              ) : (
                <span>Aguardando pelo QR Code</span>
              )}
            </div>
            
            <div className={classes.instructions}>
              <Typography variant="h6" gutterBottom>
                Como escanear o QR Code:
              </Typography>
              <ol>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em <strong>Mais opções</strong> (⋮) e depois em <strong>Aparelhos conectados</strong></li>
                <li>Toque em <strong>Conectar um dispositivo</strong></li>
                <li>Aponte a câmera do celular para o QR Code ao lado</li>
              </ol>
              
              <div className={classes.gifContainer}>
                <img 
                  src="https://faedeveloper.com.br/wp-content/uploads/2025/05/gifleitorqr.gif" 
                  alt="Como escanear o QR Code" 
                  className={classes.gif}
                  onError={(e) => {
                    // Fallback em caso de erro ao carregar o GIF
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
