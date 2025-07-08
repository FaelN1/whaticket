import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
// import MessageModal from "../../components/MessageModal"
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { Dialog, DialogContent, DialogTitle, Typography, Fab, Tooltip, IconButton } from "@material-ui/core";
import { HelpOutline, Close as CloseIcon } from "@material-ui/icons";

import "./Schedules.css"; // Importe o arquivo CSS

// Defina a função getUrlParam antes de usá-la
function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px", // Defina um tamanho de fonte menor
  overflow: "hidden", // Oculte qualquer conteúdo excedente
  whiteSpace: "nowrap", // Evite a quebra de linha do texto
  textOverflow: "ellipsis", // Exiba "..." se o texto for muito longo
};

const localizer = momentLocalizer(moment);
var defaultMessages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Todo",
  week: "Semana",
  work_week: "Agendamentos",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há agendamentos no período.",
  showMore: function showMore(total) {
    return "+" + total + " mais";
  }
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    const schedules = action.payload;
    const newSchedules = [];

    schedules.forEach((schedule) => {
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
      } else {
        newSchedules.push(schedule);
      }
    });

    return [...state, ...newSchedules];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;

    const scheduleIndex = state.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex !== -1) {
      state.splice(scheduleIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  rbc: {
    "& .rbc-header": {
      padding: "12px 6px !important",
      "& a": {
        paddingBottom: 0,
        color: theme.palette.primary.main,
        fontWeight: 500,
      },
      "& a:hover": {
        color: theme.palette.primary.dark,
      },
    },
  },
  calendarToolbar: {
    "& .rbc-toolbar": {
      "& .rbc-toolbar-label": {
        color: theme.palette.primary.main,
        fontWeight: "bold",
      },
    },
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

const Schedules = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [contactId, setContactId] = useState(null);
  const companyId = user.companyId;
  
  // Estados para controlar o pop-up de vídeo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const videoId = "dQw4w9WgXcQ"; // ID do vídeo do YouTube - substitua pelo ID do seu vídeo

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useSchedules) {
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
    const hasVisitedSchedules = localStorage.getItem('hasVisitedSchedules');
    if (!hasVisitedSchedules) {
      setFirstVisit(true);
      setVideoModalOpen(true);
      localStorage.setItem('hasVisitedSchedules', 'true');
    }
  }, []);

  useEffect(() => {
    setContactId(+getUrlParam("contactId"));
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    // handleOpenScheduleModalFromContactId();
    // const socket = socketManager.GetSocket(user.companyId, user.id);


    const onCompanySchedule = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    }

    socket.on(`company${user.companyId}-schedule`, onCompanySchedule)

    return () => {
      socket.off(`company${user.companyId}-schedule`, onCompanySchedule)
    };
  }, [socket]);

  const cleanContact = () => {
    setContactId(null);
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
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

  const truncate = (str, len) => {
    if (str.length > len) {
      return str.substring(0, len) + "...";
    }
    return str;
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
      {/* Modal de vídeo tutorial */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        className={classes.videoDialog}
        aria-labelledby="video-tutorial-dialog-title"
      >
        <div className={classes.dialogTitle}>
          <Typography variant="h6" id="video-tutorial-dialog-title">
            Como Usar os Agendamentos
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
              src="https://www.youtube.com/embed/f8N9Vq9cOUU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          reload={fetchSchedules}
          // aria-labelledby="form-dialog-title"
          scheduleId={
            selectedSchedule ? selectedSchedule.id : null
          }
          contactId={contactId}
          cleanContact={cleanContact}
        />
      )}
      <MainHeader>
        <Title>{i18n.t("schedules.title")} ({schedules.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleModal}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <Calendar
          messages={defaultMessages}
          formats={{
            agendaDateFormat: "DD/MM ddd",
            weekdayFormat: "dddd"
          }}
          localizer={localizer}
          events={schedules.map((schedule) => ({
            title: (
              <div key={schedule.id} className="event-container">
                <div style={eventTitleStyle}>{schedule?.contact?.name}</div>
                <DeleteOutlineIcon
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="delete-icon"
                />
                <EditIcon
                  onClick={() => {
                    handleEditSchedule(schedule);
                    setScheduleModalOpen(true);
                  }}
                  className="edit-icon"
                />
              </div>
            ),
            start: new Date(schedule.sendAt),
            end: new Date(schedule.sendAt),
          }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          className={classes.calendarToolbar}
        />
      </Paper>
      
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

export default Schedules;