import React, { useContext, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { 
  Typography, 
  Grid, 
  Container,
  Box,
  Paper,
  Fab,
  Tooltip,
  Button,
  CircularProgress
} from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import MainContainer from "../components/MainContainer";
import { AuthContext } from "../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles,
    // Customização da barra de rolagem para torná-la completamente invisível
    '&::-webkit-scrollbar': {
      width: '0px', // Largura zero para torná-la invisível
      background: 'transparent', // Fundo transparente
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent', // Trilho transparente
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent', // Barra transparente
      border: 'none',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'transparent', // Sem efeito hover
    },
  },
  contentContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    color: "#000",
    textAlign: "center"
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: theme.spacing(2),
    color: "#555",
    textAlign: "center"
  },
  highlight: {
    color: "#25D366",
    fontWeight: "bold",
  },
  videoWrapper: {
    maxWidth: "100%",
    margin: "0 auto",
    marginBottom: theme.spacing(4),
    border: "2px solid #25D366",
    borderRadius: "12px",
    overflow: "hidden",
  },
  videoContainer: {
    position: "relative",
    paddingBottom: "56.25%", /* 16:9 aspect ratio */
    height: 0,
    overflow: "hidden",
  },
  videoIframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  },
  featureSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
  },
  featureGrid: {
    marginTop: theme.spacing(4),
  },
  featureImageContainer: {
    height: "350px",
    overflow: "hidden",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  featureImageLarge: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  featureTitle: {
    color: "#25D366",
    fontWeight: "bold",
    fontSize: "1.2rem",
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  featureText: {
    color: "#fff",
    fontSize: "0.9rem",
  },
  featureContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  planButton: {
    backgroundColor: "#25D366",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 20px",
    marginBottom: theme.spacing(4),
    "&:hover": {
      backgroundColor: "#128C7E",
    },
  },
  headerText: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
    maxWidth: "600px",
    margin: "0 auto",
  },
  whatsappButton: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    backgroundColor: "#25D366",
    color: "#fff",
    borderRadius: "50%", // Mantém o formato circular
    "&:hover": {
      backgroundColor: "#128C7E",
    },
    zIndex: 1000,
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Sombra sutil para destacar o botão
  },
  atendimentoButton: {
    position: "fixed",
    bottom: theme.spacing(4),
    left: theme.spacing(10),
    backgroundColor: "#171619",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px 20px",
    borderRadius: "40px", // Bordas mais arredondadas
    "&:hover": {
      backgroundColor: "#1de414",
    },
    zIndex: 1000,
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Sombra sutil para destacar o botão
  },
}));

const HelpPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [planoAtual, setPlanoAtual] = useState("");

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/5194556916`, "_blank");
  };

  const handleFinanceiroClick = () => {
    history.push("/financeiro");
  };

  const handleAtendimentoClick = () => {
    history.push("/tickets");
  };

  useEffect(() => {
    const fetchPlanoAtual = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/financeiro/plano-atual");
        if (data && data.plano) {
          setPlanoAtual(data.plano);
        } else {
          setPlanoAtual("Premium Master"); // Valor padrão caso não consiga obter o plano
        }
      } catch (error) {
        console.error("Erro ao buscar plano atual:", error);
        setPlanoAtual("Premium Master2"); // Valor padrão em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchPlanoAtual();
  }, []);

  return (
    <MainContainer>
      <Container className={classes.mainContainer}>
        <Box className={classes.contentContainer}>
          {/* Texto acima do vídeo */}
          <Box mb={3}>
            <Typography variant="subtitle1" className={classes.subtitle}>
              Centralize e agilize o atendimento da sua empresa
            </Typography>
            <Typography variant="h5" className={classes.title}>
              Assista este vídeo de 2 minutos agora e economize horas depois...
            </Typography>
          </Box>

          {/* Video Section */}
          <Box className={classes.videoWrapper}>
            <Box className={classes.videoContainer}>
              <iframe
                className={classes.videoIframe}
                src="https://www.youtube.com/embed/vXKQooUE1P4"
                title="Tutorial Whaticket"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Box>
          </Box>

          {/* Features Section with 3 Images */}
          <Box className={classes.featureSection}>
            <Grid container spacing={4} className={classes.featureGrid}>
              <Grid item xs={12} sm={4}>
                <Box className={classes.featureImageContainer} position="relative">
                  <img 
                    src="https://atendzappy.com.br/wp-content/uploads/2024/11/Post-atendzappy.png" 
                    alt="Desbloqueie o Poder da IA" 
                    className={classes.featureImageLarge}
                  />
                  <Box className={classes.featureContent}>
                    <Typography className={classes.featureTitle}>
                      Desbloqueie o Poder da IA
                    </Typography>
                    <Typography className={classes.featureText}>
                      Transforme seu atendimento ao cliente em uma experiência excepcional, ágil, humanizada e eficiente.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className={classes.featureImageContainer} position="relative">
                  <img 
                    src="https://atendzappy.com.br/wp-content/uploads/2024/11/Post-atendzappy.png" 
                    alt="Chatbot para WhatsApp" 
                    className={classes.featureImageLarge}
                  />
                  <Box className={classes.featureContent}>
                    <Typography className={classes.featureTitle}>
                      Chatbot para WhatsApp
                    </Typography>
                    <Typography className={classes.featureText}>
                      Organize seu atendimento no WhatsApp por setor, conforme o objetivo de seu cliente. Mais agilidade, melhor atendimento, muito mais vendas.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className={classes.featureImageContainer} position="relative">
                  <img 
                    src="https://atendzappy.com.br/wp-content/uploads/2024/11/Post-atendzappy.png" 
                    alt="Atendimento Múltiplo" 
                    className={classes.featureImageLarge}
                  />
                  <Box className={classes.featureContent}>
                    <Typography className={classes.featureTitle}>
                      Atendimento Múltiplo
                    </Typography>
                    <Typography className={classes.featureText}>
                      Atenda com diversos atendentes ao mesmo tempo. No mesmo WhatsApp.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Botão flutuante do WhatsApp */}
      <Tooltip title="Fale conosco no WhatsApp">
        <Fab 
          className={classes.whatsappButton}
          onClick={handleWhatsAppClick}
          aria-label="WhatsApp"
        >
          <WhatsAppIcon />
        </Fab>
      </Tooltip>

      {/* Botão para ir para atendimento */}
      <Button
        variant="contained"
        className={classes.atendimentoButton}
        onClick={handleAtendimentoClick}
        style={{ borderRadius: '40px' }}
      >
        IR PARA ATENDIMENTO
      </Button>
    </MainContainer>
  );
};

export default HelpPage;
