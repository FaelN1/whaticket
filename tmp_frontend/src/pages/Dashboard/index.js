import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
// import {  Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { IconButton } from "@mui/material";
import { Groups, SaveAlt } from "@mui/icons-material";

import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import * as XLSX from 'xlsx';

import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import TabPanel from "../../components/TabPanel"
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { Avatar, Button, Card, CardContent, Container, Stack, SvgIcon, Tab, Tabs } from "@mui/material";
import { i18n } from "../../translate/i18n";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import ForbiddenPage from "../../components/ForbiddenPage";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  overline: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: "grey",
    letterSpacing: '0.5px',
    lineHeight: 2.5,
    textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', sans-serif'",
  },
  h4: {
    fontFamily: "'Plus Jakarta Sans', sans-serif'",
    fontWeight: 500,
    fontSize: '2rem',
    lineHeight: 1,
    color: "grey",
  },
  tab: {
    minWidth: "auto",
    width: "auto",
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    transition: "0.3s",
    borderWidth: "1px",
    borderStyle: "solid",
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),

    [theme.breakpoints.down("lg")]: {
      fontSize: "0.9rem",
      padding: theme.spacing(0.4, 0.8),
      marginRight: theme.spacing(0.4),
      marginLeft: theme.spacing(0.4),
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
      padding: theme.spacing(0.3, 0.6),
      marginRight: theme.spacing(0.3),
      marginLeft: theme.spacing(0.3),
    },
    "&:hover": {
      backgroundColor: "rgba(6, 81, 131, 0.3)",
    },
    "&$selected": {
      color: "#FFF",
      backgroundColor: theme.palette.primary.main,
    },
  },
  tabIndicator: {
    borderWidth: "2px",
    borderStyle: "solid",
    height: 6,
    bottom: 0,
    color: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
    maxWidth: "1150px",
    minWidth: "xs",
  },
  nps: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const Dashboard = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  //FILTROS NPS
  const [tab, setTab] = useState("Indicadores");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedQueues, setSelectedQueues] = useState([]);



  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;

  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(nowIni);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);
  const [fetchDataFilter, setFetchDataFilter] = useState(false);

  const { user } = useContext(AuthContext);


  const exportarGridParaExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById('grid-attendants'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendentes');
    XLSX.writeFile(wb, 'relatorio-de-atendentes.xlsx');
  };

  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDataFilter]);

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
      params = {
        ...params,
        date_from: moment(dateStartTicket).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
      params = {
        ...params,
        date_to: moment(dateEndTicket).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);


    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };


  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    } else {
      props = {
        dateStart: dateStartTicket,
        dateEnd: dateEndTicket,
      };
    }
    const { count } = useContacts(props);
    return count;
  };

  const GetMessages = (all, fromMe) => {
    let props = {};
    if (all) {
      if (fromMe) {
        props = {
          fromMe: true
        };
      } else {
        props = {
          fromMe: false
        };
      }
    } else {
      if (fromMe) {
        props = {
          fromMe: true,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      } else {
        props = {
          fromMe: false,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      }
    }
    const { count } = useMessages(props);
    return count;
  };

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  return (
    <>
      {
        user.profile === "user" && user.showDashboard === "disabled" ?
          <ForbiddenPage />
          :
          <>
            <div>
              <Container maxWidth="lg" className={classes.container}>
                <Grid2 container spacing={3} className={classes.container}>

                  {/* FILTROS */}
                  <Grid2 xs={12}>
                    <Button
                      onClick={toggleShowFilter}
                      style={{ float: "right" }}
                      color="primary"
                    >
                      {!showFilter ? (
                        <FilterListIcon />
                      ) : (
                        <ClearIcon />
                      )}
                    </Button>
                  </Grid2>

                  {showFilter && (
                    <Filters
                      classes={classes}
                      setDateStartTicket={setDateStartTicket}
                      setDateEndTicket={setDateEndTicket}
                      dateStartTicket={dateStartTicket}
                      dateEndTicket={dateEndTicket}
                      setQueueTicket={setQueueTicket}
                      queueTicket={queueTicket}
                      fetchData={setFetchDataFilter}
                    />
                  )}

                  <Grid2 container width="100%" justifyContent="center">
                    {/* Tabs removidas, pois todo o conteúdo está na mesma página */}
                  </Grid2>
                  <TabPanel
                    className={classes.container}
                    value={"Indicadores"} // Valor fixo para sempre mostrar a aba de indicadores
                    name={"Indicadores"}
                  >
                    <Container maxWidth="xl" >
                      <Grid2
                        container
                        spacing={3}
                      >
                        {/* EM ATENDIMENTO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.inAttendance")}
                                  </Typography>
                                  <Typography variant="h4" className={classes.h4}>
                                    {counters.supportHappening}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#0b708c',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <CallIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* AGUARDANDO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.waiting")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.supportPending}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#47606e',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <HourglassEmptyIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* FINALIZADOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.finalized")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.supportFinished}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#5852ab',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <CheckCircleIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* GRUPOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.groups")}
                                  </Typography>
                                  <Typography variant="h4"

                                    className={classes.h4}
                                  >
                                    {counters.supportGroups}
                                  </Typography>
                                </Stack>

                                <Avatar
                                  sx={{
                                    backgroundColor: '#01BBAC',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <Groups />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* ATENDENTES ATIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.activeAttendants")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {GetUsers()}/{attendants.length}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#805753',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <RecordVoiceOverIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* NOVOS CONTATOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.newContacts")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.leads}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#8c6b19',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <GroupAddIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* MINHAS MENSAGEM RECEBIDAS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.totalReceivedMessages")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {GetMessages(false, false)}/{GetMessages(true, false)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#333133',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <MessageIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* MINHAS MENSAGEM ENVIADAS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.totalSentMessages")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {GetMessages(false, true)}/{GetMessages(true, true)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#558a59',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <SendIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* T.M. DE ATENDIMENTO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.averageServiceTime")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {formatTime(counters.avgSupportTime)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#F79009',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <AccessAlarmIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* T.M. DE ESPERA */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.averageWaitingTime")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {formatTime(counters.avgWaitTime)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: '#8a2c40',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <TimerIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* TICKETS ATIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.activeTickets")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.activeTickets}
                                  </Typography>
                                </Stack>

                                <Avatar
                                  sx={{
                                    backgroundColor: '#EE4512',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <ArrowUpward />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* TICKETS PASSIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor:
                              theme.mode === "light"
                                ? "transparent"
                                : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.passiveTickets")}
                                  </Typography>
                                  <Typography variant="h4"

                                    className={classes.h4}
                                  >
                                    {counters.passiveTickets}
                                  </Typography>
                                </Stack>


                                <Avatar
                                  sx={{
                                    backgroundColor: '#28C037',
                                    height: 60,
                                    width: 60
                                  }}
                                >
                                  <SvgIcon>
                                    <ArrowDownward />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>
                      </Grid2>
                    </Container>

                    {/* Seção NPS - Adicionada abaixo dos indicadores */}
                    <Container maxWidth="xl" sx={{ mt: 4 }}>
                      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                        Avaliações NPS
                      </Typography>
                      
                      {/* Cards superiores com métricas principais */}
                      <Grid2 container spacing={3} mb={3}>
                        {/* Card Score NPS */}
                        <Grid2 xs={12} sm={4}>
                          <Card sx={{
                            height: "100%",
                            backgroundColor: theme.mode === "light" ? "transparent" : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack spacing={1}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      backgroundColor: '#0b708c',
                                      height: 40,
                                      width: 40,
                                      marginRight: '10px'
                                    }}
                                  >
                                    <SvgIcon>
                                      <RecordVoiceOverIcon />
                                    </SvgIcon>
                                  </Avatar>
                                  <Typography variant="h6">
                                    Score NPS
                                  </Typography>
                                </div>
                                <Typography variant="h3" fontWeight="bold">
                                  {counters.npsScore || 0}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Avaliações: {counters.withRating || 0} de {counters.tickets || 0}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* Card Promotores */}
                        <Grid2 xs={12} sm={4}>
                          <Card sx={{
                            height: "100%",
                            backgroundColor: theme.mode === "light" ? "transparent" : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack spacing={1}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      backgroundColor: '#2EA85A',
                                      height: 40,
                                      width: 40,
                                      marginRight: '10px'
                                    }}
                                  >
                                    <SvgIcon>
                                      <CheckCircleIcon />
                                    </SvgIcon>
                                  </Avatar>
                                  <Typography variant="h6">
                                    Promotores
                                  </Typography>
                                </div>
                                <Typography variant="h3" fontWeight="bold">
                                  {counters.npsPromotersPerc || 0}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Clientes que recomendam seu serviço
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* Card Detratores */}
                        <Grid2 xs={12} sm={4}>
                          <Card sx={{
                            height: "100%",
                            backgroundColor: theme.mode === "light" ? "transparent" : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Stack spacing={1}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      backgroundColor: '#F73A2C',
                                      height: 40,
                                      width: 40,
                                      marginRight: '10px'
                                    }}
                                  >
                                    <SvgIcon>
                                      <ClearIcon />
                                    </SvgIcon>
                                  </Avatar>
                                  <Typography variant="h6">
                                    Detratores
                                  </Typography>
                                </div>
                                <Typography variant="h3" fontWeight="bold">
                                  {counters.npsDetractorsPerc || 0}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Clientes insatisfeitos com o serviço
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>
                      </Grid2>

                      {/* Gráficos principais */}
                      <Grid2 container spacing={3}>
                        {/* Tabela de Categorias */}
                        <Grid2 xs={12}>
                          <Card sx={{
                            height: "100%",
                            backgroundColor: theme.mode === "light" ? "transparent" : "rgba(170, 170, 170, 0.2)",
                          }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Categorias de Avaliação
                              </Typography>
                              <div style={{ height: '300px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                                      <th style={{ padding: '8px', textAlign: 'left' }}>Categoria</th>
                                      <th style={{ padding: '8px', textAlign: 'right' }}>Atual</th>
                                      <th style={{ padding: '8px', textAlign: 'right' }}>Anterior</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Promotores</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.npsPromotersPerc || 0}%</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Neutros</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.npsPassivePerc || 0}%</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Detratores</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.npsDetractorsPerc || 0}%</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Total Avaliações</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.withRating || 0}</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Sem Avaliação</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.withoutRating || 0}</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Aguardando</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.waitRating || 0}</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Total Atendimentos</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{counters.tickets || 0}</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                      <td style={{ padding: '8px' }}>Índice de Avaliação</td>
                                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{Number(counters.percRating / 100).toLocaleString(undefined, { style: 'percent' })}</td>
                                      <td style={{ padding: '8px', textAlign: 'right' }}>-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        </Grid2>
                      </Grid2>
                    </Container>

                    {/* Seção Atendentes - Adicionada abaixo do NPS */}
                    <Container maxWidth="xl" sx={{ mt: 4 }}>
                      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                        Atendentes
                      </Typography>
                      
                      <Grid2 container width="100%">
                        <Grid2 container width="100%" alignItems="center" mb={2}>
                          <IconButton onClick={exportarGridParaExcel} aria-label="Exportar para Excel">
                            <SaveAlt />
                          </IconButton>
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            Exportar para Excel
                          </Typography>
                        </Grid2>

                        {/* INFO DOS USUARIOS */}
                        <Grid2 xs={12} id="grid-attendants">
                          {attendants.length ? (
                            <TableAttendantsStatus
                              attendants={attendants}
                              loading={loading}
                            />
                          ) : null}
                        </Grid2>

                        {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
                        <Grid2 xs={12} id="grid-attendants">
                          <Paper className={classes.fixedHeightPaper2}>
                            <ChatsUser />
                          </Paper>
                        </Grid2>

                        {/* TOTAL DE ATENDIMENTOS */}
                        <Grid2 xs={12} id="grid-attendants">
                          <Paper className={classes.fixedHeightPaper2}>
                            <ChartsDate />
                          </Paper>
                        </Grid2>
                      </Grid2>
                    </Container>
                  </TabPanel>

                  {/* Abas vazias removidas, pois todo o conteúdo está na aba Indicadores */}
                </Grid2>
              </Container >
            </div >
          </>
      }
    </>
  );
};

export default Dashboard;
