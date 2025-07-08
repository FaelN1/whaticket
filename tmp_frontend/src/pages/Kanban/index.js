import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp, HelpOutline, Close as CloseIcon } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box, Dialog, DialogContent, DialogTitle, Fab, IconButton } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  kanbanContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    borderRadius: 3,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto"
  },
  cardButton: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    fontSize: "0.8rem",
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    fontSize: "0.8rem",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    width: "100%",
    maxWidth: "1200px",
    padding: theme.spacing(1),
  },
  dateInput: {
    margin: theme.spacing(1),
    width: "150px",
  },
  videoDialog: {
    '& .MuiDialog-paper': {
      width: '80%',
      maxWidth: '800px',
    },
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
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
  popupContent: {
    padding: theme.spacing(2),
  },
}));

function Kanban() {
  const classes = useStyles();
  const theme = useTheme(); // Obter o tema atual
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  // Estados para controlar o pop-up
  const [popupOpen, setPopupOpen] = useState(false);

  // Funções para controlar o pop-up
  const handleOpenPopup = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  // Verificar se é a primeira visita à página
  useEffect(() => {
    const hasVisitedKanban = localStorage.getItem('hasVisitedKanban');
    if (!hasVisitedKanban) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedKanban', 'true');
    }
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  // Modificar o fetchTickets para carregar as tags dos contatos

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });
      const ticketsWithContactTags = [];
      for (const ticket of data.tickets) {
        try {
          const contactResponse = await api.get(`/contacts/${ticket.contactId}`);
          ticket.contact.tags = contactResponse.data.tags || [];
          ticketsWithContactTags.push(ticket);
        } catch (contactErr) {
          console.error(`Erro ao buscar tags do contato ${ticket.contactId}:`, contactErr);
          ticket.contact.tags = [];
          ticketsWithContactTags.push(ticket);
        }
      }
      ticketsWithContactTags.forEach(ticket => {
        if (ticket.tags && ticket.tags.length > 0) {
          console.log(`Ticket ${ticket.id} - Todas as tags:`, ticket.tags);
          const ticketNormalTags = ticket.tags.filter(tag =>
            tag.kanban === 0 || tag.kanban === false || tag.kanban === null
          );

          // Identificar tags de Kanban (kanban: 1)
          const ticketKanbanTags = ticket.tags.filter(tag =>
            tag.kanban === 1
          );

          console.log(`Ticket ${ticket.id} - Tags normais:`, ticketNormalTags);
          console.log(`Ticket ${ticket.id} - Tags de Kanban:`, ticketKanbanTags);
        } else {
          console.log(`Ticket ${ticket.id} - Sem tags`);
        }

        // Verificar as tags do contato
        if (ticket.contact && ticket.contact.tags && ticket.contact.tags.length > 0) {
          console.log(`Ticket ${ticket.id} - Tags do contato:`, ticket.contact.tags);
        } else {
          console.log(`Ticket ${ticket.id} - Contato sem tags`);
        }

        // Verificar a última mensagem do ticket
        if (ticket.lastMessage) {
          console.log(`Ticket ${ticket.id} - Última mensagem:`, ticket.lastMessage);
        }
      });

      setTickets(ticketsWithContactTags);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    // Tickets sem tags ou com tags que não estão na lista de tags do kanban
    const filteredTickets = tickets.filter(ticket => {
      if (ticket.tags.length === 0) return true;

      // Verifica se o ticket tem alguma tag que não está na lista de tags do kanban
      const ticketTagIds = ticket.tags.map(tag => tag.id);
      const kanbanTagIds = tags.map(tag => tag.id);
      return !ticketTagIds.some(tagId => kanbanTagIds.includes(tagId));
    });

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              {/* Exibindo a última mensagem com limite de 25 caracteres */}
              {ticket.lastMessage && (
                <div style={{ textAlign: 'left', marginTop: '4px', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  {ticket.lastMessage.length > 25
                    ? ticket.lastMessage.substring(0, 25) + '...'
                    : ticket.lastMessage
                  }
                </div>
              )}
              <div style={{ textAlign: 'left', marginTop: '4px', marginBottom: '4px' }}>
                {/* Verificando se o ticket tem tags */}
                {ticket.tags && ticket.tags.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {/* Exibindo todas as tags do ticket */}
                    {ticket.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        style={{
                          backgroundColor: tag.color || "#ccc",
                          color: "#fff",
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          margin: '2px'
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#999' }}>Sem tags</span>
                )}
              </div>
              {/* ADICIONAR AQUI: Tags do Contato para as colunas personalizadas */}
              <div style={{ textAlign: 'left', marginTop: '4px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>Tags do Contato:</div>
                {ticket.contact && ticket.contact.tags && ticket.contact.tags.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {ticket.contact.tags.map(tag => (
                      <Badge
                        key={tag.id}
                        style={{
                          backgroundColor: tag.color || "#ccc",
                          color: "#fff",
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          margin: '2px',
                          border: '1px dashed #fff' // Borda diferenciada para tags de contato
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: '#999' }}>Contato sem tags</span>
                )}
              </div>
              <Button
                className={`${classes.button} ${classes.cardButton}`}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </Button>
              <span style={{ marginRight: '8px' }} />
              {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
            </div>
          ),
          title: <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> {ticket.contact.name}</>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      // Ordena as tags por posição antes de criar as lanes
      ...tags
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          // Verifica se o ticket tem a tag atual
          return ticket.tags.some(ticketTag => ticketTag.id === tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{ticket.contact.number}</span>
                  <Typography
                    className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                    component="span"
                    variant="body2"
                  >
                    {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                      <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                    ) : (
                      <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                    )}
                  </Typography>
                </div>

                {/* Exibindo a última mensagem com limite de 25 caracteres */}
                {ticket.lastMessage && (
                  <div style={{ textAlign: 'left', marginTop: '4px', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    {ticket.lastMessage.length > 25
                      ? ticket.lastMessage.substring(0, 25) + '...'
                      : ticket.lastMessage
                    }
                  </div>
                )}

                <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                  {/* Verificando se o ticket tem tags e filtrando a tag que corresponde à coluna atual */}
                  {ticket.tags && ticket.tags.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {/* Filtrando para não mostrar a tag que tem o mesmo nome da lane atual */}
                      {ticket.tags
                        .filter(ticketTag => ticketTag.name !== tag.name)
                        .map(ticketTag => (
                          <Badge
                            key={ticketTag.id}
                            style={{
                              backgroundColor: ticketTag.color || "#ccc",
                              color: "#fff",
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              margin: '2px'
                            }}
                          >
                            {ticketTag.name}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#999' }}>Sem tags</span>
                  )}
                </div>
                <div style={{ textAlign: 'left', marginTop: '4px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>Tags do Contato:</div>
                  {ticket.contact && ticket.contact.tags && ticket.contact.tags.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ticket.contact.tags.map(tag => (
                        <Badge
                          key={tag.id}
                          style={{
                            backgroundColor: tag.color || "#ccc",
                            color: "#fff",
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            margin: '2px',
                            border: '1px dashed #fff' // Borda diferenciada para tags de contato
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#999' }}>Contato sem tags</span>
                  )}
                </div>

                <Button
                  className={`${classes.button} ${classes.cardButton}`}
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}>
                  Ver Ticket
                </Button>
                <span style={{ marginRight: '8px' }} />
                {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
              </div>
            ),
            title: <>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> {ticket.contact.name}
            </>,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: tag.color, color: "white" }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  // Versão mais eficiente do handleCardMove

  // Substitua a função handleCardMove pelo código abaixo:

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      // 1. Primeiro salvar o objeto ticket completo com suas tags de contato
      const ticketBeingMoved = tickets.find(ticket => ticket.id.toString() === cardId);

      // 2. Guardar especificamente as tags do contato que precisamos preservar
      const contactTagsToPreserve = ticketBeingMoved?.contact?.tags || [];

      // 3. Executar as operações da API para mover o cartão
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');

      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');

      // 4. Buscar os tickets atualizados, mas NÃO atualizar o estado ainda
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });

      // 5. Encontrar o ticket movido na nova lista
      const updatedTickets = data.tickets.map(ticket => {
        // 6. Se for o mesmo ticket que movemos, restaurar as tags do contato
        if (ticket.id.toString() === cardId) {
          // Preservar as informações do contato e adicionar as tags salvas anteriormente
          return {
            ...ticket,
            contact: {
              ...ticket.contact,
              tags: contactTagsToPreserve
            }
          };
        }
        // Caso contrário, buscar as tags do contato para os outros tickets
        return ticket;
      });

      // 7. Para cada ticket na lista atualizada, buscar as tags de contato
      const ticketsWithContactTags = [];

      for (const ticket of updatedTickets) {
        try {
          // Se este é o ticket que foi movido, use as tags preservadas
          if (ticket.id.toString() === cardId) {
            ticketsWithContactTags.push(ticket); // Já tem as tags preservadas
          } else {
            // Para outros tickets, buscar do servidor
            const contactResponse = await api.get(`/contacts/${ticket.contactId}`);
            ticket.contact.tags = contactResponse.data.tags || [];
            ticketsWithContactTags.push(ticket);
          }
        } catch (contactErr) {
          console.error(`Erro ao buscar tags do contato ${ticket.contactId}:`, contactErr);
          ticket.contact.tags = [];
          ticketsWithContactTags.push(ticket);
        }
      }

      // 8. Atualizar o estado com os tickets completos
      setTickets(ticketsWithContactTags);

      // 9. Atualizar a visualização
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/TagsKanban');
  };

  // Funções para controlar o modal de vídeo
  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.searchContainer}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            className={classes.dateInput}
          />
          <Box mx={1} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
          >
            Buscar
          </Button>
        </div>
        <Can role={user.profile} perform="dashboard:view" yes={() => (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddConnectionClick}
          >
            {'+ Adicionar colunas'}
          </Button>
        )} />
      </div>
      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
        />
      </div>

      {/* Botão flutuante */}
      <Fab
        color="primary"
        aria-label="help"
        className={classes.helpFab}
        onClick={handleOpenPopup}
      >
        <HelpOutline />
      </Fab>

      {/* Pop-up */}
      <Dialog
        open={popupOpen}
        onClose={handleClosePopup}
        aria-labelledby="popup-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="popup-dialog-title">
          <Typography variant="h6">Ajuda do Kanban</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={handleClosePopup}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.popupContent}>
          <Typography variant="body1" paragraph>
            <strong>Como usar o Kanban:</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            1. O Kanban é uma ferramenta visual para gerenciar seus atendimentos.
          </Typography>
          <Typography variant="body2" paragraph>
            2. Você pode arrastar os cards entre as colunas para mudar o status do atendimento.
          </Typography>
          <Typography variant="body2" paragraph>
            3. Clique em "Ver Ticket" para abrir o atendimento completo.
          </Typography>
          <Typography variant="body2" paragraph>
            4. Use o botão "+ Adicionar colunas" para criar novas colunas no Kanban.
          </Typography>
          <Typography variant="body2" paragraph>
            5. Filtre os atendimentos por data usando os campos de data no topo da página.
          </Typography>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenVideoModal}
              fullWidth
            >
              Assistir vídeo tutorial
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        className={classes.videoDialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6">Como Usar o Kanban</Typography>
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
              title="Como usar o Kanban"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
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
    </div>
  );
}

export default Kanban;
