import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import HomeIcon from "@material-ui/icons/Home";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ViewKanban from "@mui/icons-material/ViewKanban";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import AddIcon from "@material-ui/icons/Add";
import {
  AllInclusive,
  AttachFile,
  Dashboard,
  Description,
  DeviceHubOutlined,
  GridOn,
  PhonelinkSetup,
} from "@material-ui/icons";
import HelpIcon from "@material-ui/icons/Help";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";

import { Can } from "../components/Can";

import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "44px",
    width: "auto",
    "&:hover $iconHoverActive": {
      backgroundColor: "#ffffff", // Cor de hover ao passar o mouse (branco)
      color: "#18181a",
    },
  },

  listItemText: {
    fontSize: "14px",
    color: "#fff", // Texto branco para contrastar com o fundo escuro
  },
  avatarActive: {
    backgroundColor: "transparent",
  },
  avatarHover: {
    backgroundColor: "transparent",
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    height: 36,
    width: 36,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Fundo sutil para os ícones
    color: "#ffffff", // Cor dos ícones branca
    "&:hover, &.active": {
      backgroundColor: "#ffffff", // Cor de fundo ao passar o mouse ou quando ativo
      color: "#18181a", // Texto escuro quando hover/ativo para contrastar com o fundo branco
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.4rem",
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem button component={renderLink} className={classes.listItem}>
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge badgeContent="!" color="error" overlap="circular" className={classes.badge}>
                  <Avatar className={`${classes.iconHoverActive} ${isActive ? "active" : ""}`}>{icon}</Avatar>
                </Badge>
              ) : (
                <Avatar className={`${classes.iconHoverActive} ${isActive ? "active" : ""}`}>{icon}</Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText primary={<Typography className={classes.listItemText}>{primary}</Typography>} />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [openAdvancedSubmenu, setOpenAdvancedSubmenu] = useState(false); // Novo estado para o submenu avançado
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [advancedHover, setAdvancedHover] = useState(false); // Novo estado para hover do submenu avançado
  const { list } = useHelps();  // INSERIR
  const [hasHelps, setHasHelps] = useState(false);

  // Função para abrir links externos
  const openExternalLink = (url) => {
    window.open(url, '_blank');
  };

  useEffect(() => {   // INSERIR ESSE EFFECT INTEIRO
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const isManagementActive =
    location.pathname === "/" || location.pathname.startsWith("/reports") || location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      //    const socket = socketManager.GetSocket();
      // console.log('socket nListItems')
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleCampaignSubmenuClick = () => {
    setOpenCampaignSubmenu((prev) => !prev);
  };

  const handleDashboardSubmenuClick = () => {
    setOpenDashboardSubmenu((prev) => !prev);
  };

  const handleAdvancedSubmenuClick = () => {
    setOpenAdvancedSubmenu((prev) => !prev);
  };

  return (
    <div onClick={drawerClose}>
      {/* Botão de Início como primeiro item do menu */}
      <ListItemLink
        to="/ajuda"
        primary="Início"
        icon={<HomeIcon />}
        tooltip={collapsed}
      />
      
      {planExpired && (
        <Can
          role={
            (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
              ? "admin"
              : user.profile
          }
          perform={"drawer-admin-items:view"}
          yes={() => (
            <>
              <Tooltip title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""} placement="right">
                <ListItem
                  dense
                  button
                  onClick={handleDashboardSubmenuClick}
                  onMouseEnter={() => setManagementHover(true)}
                  onMouseLeave={() => setManagementHover(false)}
                >
                  <ListItemIcon>
                    <Avatar
                      className={`${classes.iconHoverActive} ${isManagementActive || managementHover ? "active" : ""}`}
                    >
                      <Dashboard />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={classes.listItemText}>
                        {i18n.t("mainDrawer.listItems.management")}
                      </Typography>
                    }
                  />
                  {openDashboardSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItem>
              </Tooltip>
              <Collapse
                in={openDashboardSubmenu}
                timeout="auto"
                unmountOnExit
                style={{
                  backgroundColor: theme.mode === "light" ? "rgba(120,120,120,0.1)" : "rgba(120,120,120,0.5)",
                }}
              >
                <Can
                  role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <>
                      <ListItemLink
                        small
                        to="/"
                        primary="Dashboard"
                        icon={<DashboardOutlinedIcon />}
                        tooltip={collapsed}
                      />
                      {/* Link para relatórios ocultado conforme solicitado
                      <ListItemLink
                        small
                        to="/reports"
                        primary={i18n.t("mainDrawer.listItems.reports")}
                        icon={<Description />}
                        tooltip={collapsed}
                      />
                      */}
                    </>
                  )}
                />
                <Can
                  role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <ListItemLink
                      to="/moments"
                      primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                      icon={<GridOn />}
                      tooltip={collapsed}
                    />
                  )}
                />
              </Collapse>
            </>
          )}
        />
      )}

      {planExpired && (
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<WhatsAppIcon />}
          tooltip={collapsed}
        />
      )}

        {planExpired && (
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<FlashOnIcon />}
          tooltip={collapsed}
        />
      )}

        {showKanban && planExpired && (
          <>
            <ListItemLink
              to="/kanban"
              primary={i18n.t("mainDrawer.listItems.kanban")}
              icon={<ViewKanban />}
              tooltip={collapsed}
            />
          </>
        )}

      {planExpired && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<ContactPhoneOutlinedIcon />}
          tooltip={collapsed}
        />
      )}

        {showSchedules && planExpired && (
          <>
            <ListItemLink
              to="/schedules"
              primary={i18n.t("mainDrawer.listItems.schedules")}
              icon={<Schedule />}
              tooltip={collapsed}
            />
          </>
        )}

      {planExpired && (
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<LocalOfferIcon />}
          tooltip={collapsed}
        />
      )}

        {/* <ListItemLink
          to="/todolist"
          primary={i18n.t("Tarefas")}
          icon={<LocalOfferIcon />}
        /> */}

        {/* Chat Interno oculto */}
        {/* {showInternalChat && planExpired && (
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <ForumIcon />
              </Badge>
            }
            tooltip={collapsed}
          />
        )} */}
        {hasHelps && planExpired && (
          <ListItemLink
            to="/helps"
            primary={i18n.t("mainDrawer.listItems.helps")}
            icon={<HelpIcon />}
            tooltip={collapsed}
          />
        )}

        {/* Botão de Campanhas movido para antes do botão "+" */}
        {showCampaigns && planExpired && (
          <>
            <Tooltip
              title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""}
              placement="right"
              arrow
            >
              <ListItem
                dense
                button
                onClick={handleCampaignSubmenuClick}
                onMouseEnter={() => setCampaignHover(true)}
                onMouseLeave={() => setCampaignHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${openCampaignSubmenu || campaignHover ? "active" : ""}`}
                  >
                    <EventAvailableIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      {i18n.t("mainDrawer.listItems.campaigns")}
                    </Typography>
                  }
                />
                {openCampaignSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openCampaignSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor: theme.mode === "light" ? "rgba(120,120,120,0.1)" : "rgba(120,120,120,0.5)",
              }}
            >
              <List dense component="div" disablePadding>
                <ListItemLink
                  to="/campaigns"
                  primary={i18n.t("campaigns.subMenus.list")}
                  icon={<ListIcon />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/contact-lists"
                  primary={i18n.t("campaigns.subMenus.listContacts")}
                  icon={<PeopleIcon />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/campaigns-config"
                  primary={i18n.t("campaigns.subMenus.settings")}
                  icon={<SettingsOutlinedIcon />}
                  tooltip={collapsed}
                />
              </List>
            </Collapse>
          </>
        )}

        {planExpired && (
          <>
            <Tooltip
              title={collapsed ? "Mais Opções" : ""}
              placement="right"
              arrow
            >
              <ListItem
                dense
                button
                onClick={handleAdvancedSubmenuClick}
                onMouseEnter={() => setAdvancedHover(true)}
                onMouseLeave={() => setAdvancedHover(false)}
                style={{
                  backgroundColor: openAdvancedSubmenu
                    ? theme.mode === "light"
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.05)"
                    : null,
                }}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${openAdvancedSubmenu || advancedHover ? "active" : ""}`}
                  >
                    <AddIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      Mais Opções
                    </Typography>
                  }
                />
                {openAdvancedSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openAdvancedSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor: theme.mode === "light" ? "rgba(120,120,120,0.1)" : "rgba(120,120,120,0.5)",
              }}
            >
              <List dense component="div" disablePadding>
                {/* API */}
                {showExternalApi && (
                  <Can
                    role={user.profile}
                    perform="dashboard:view"
                    yes={() => (
                      <ListItemLink
                        to="/messages-api"
                        primary={i18n.t("mainDrawer.listItems.messagesAPI") || "API"}
                        icon={<CodeRoundedIcon />}
                        tooltip={collapsed}
                      />
                    )}
                  />
                )}

                {/* Reports */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports") || "Relatórios"}
                      icon={<Description />}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Usuários */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/users"
                      primary={i18n.t("mainDrawer.listItems.users") || "Usuários"}
                      icon={<PeopleAltOutlinedIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Filas chatbot */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/queues"
                      primary={i18n.t("mainDrawer.listItems.queues") || "Filas chatbot"}
                      icon={<AccountTreeOutlinedIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />

<ListItemLink
  to="/typebot"
  primary={i18n.t("Typebot")}
  icon={<PrecisionManufacturingIcon />}
/>

                {/* Co.IA */}
                {showOpenAi && (
                  <Can
                    role={user.profile}
                    perform="dashboard:view"
                    yes={() => (
                      <ListItemLink
                        to="/prompts"
                        primary="CO.IA"
                        icon={<AllInclusive />}
                        tooltip={collapsed}
                      />
                    )}
                  />
                )}

                {/* Integrações */}
                {showIntegrations && (
                  <Can
                    role={user.profile}
                    perform="dashboard:view"
                    yes={() => (
                      <ListItemLink
                        to="/queue-integration"
                        primary={i18n.t("mainDrawer.listItems.queueIntegration") || "Integrações"}
                        icon={<DeviceHubOutlined />}
                        tooltip={collapsed}
                      />
                    )}
                  />
                )}

                {/* Conexões */}
                <Can
                  role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <ListItemLink
                      to="/connections"
                      primary={i18n.t("mainDrawer.listItems.connections") || "Conexões"}
                      icon={<SyncAltIcon />}
                      showBadge={connectionWarning}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Todas as Conexões (apenas para super usuários) */}
                {user.super && (
                  <ListItemLink
                    to="/allConnections"
                    primary={i18n.t("mainDrawer.listItems.allConnections") || "Todas as Conexões"}
                    icon={<PhonelinkSetup />}
                    tooltip={collapsed}
                  />
                )}

                {/* Lista de arquivos */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/files"
                      primary={i18n.t("mainDrawer.listItems.files") || "Lista de arquivos"}
                      icon={<AttachFile />}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Financeiro */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/financeiro"
                      primary={i18n.t("mainDrawer.listItems.financeiro") || "Financeiro"}
                      icon={<LocalAtmIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Configurações */}
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/settings"
                      primary={i18n.t("mainDrawer.listItems.settings") || "Configurações"}
                      icon={<SettingsOutlinedIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />

                {/* Empresas (apenas para super usuários) */}
                {user.super && (
                  <ListItemLink
                    to="/companies"
                    primary={i18n.t("mainDrawer.listItems.companies") || "Empresas"}
                    icon={<BusinessIcon />}
                    tooltip={collapsed}
                  />
                )}
                
                {/* Informativos */}
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    primary={i18n.t("mainDrawer.listItems.annoucements") || "Informativos"}
                    icon={<AnnouncementIcon />}
                    tooltip={collapsed}
                  />
                )}
              </List>
            </Collapse>
          </>
        )}
        <Can
          role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              {/* Removido o Divider e o cabeçalho de Administração */}
              {/* <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={collapsed ? i18n.t("mainDrawer.listItems.campaigns") : ""}
                      placement="right"
                      arrow
                    >
                      <ListItem
                        dense
                        button
                        onClick={handleCampaignSubmenuClick}
                        onMouseEnter={() => setCampaignHover(true)}
                        onMouseLeave={() => setCampaignHover(false)}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${openCampaignSubmenu || campaignHover ? "active" : ""}`}
                          >
                            <EventAvailableIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className={classes.listItemText}>
                              {i18n.t("mainDrawer.listItems.campaigns")}
                            </Typography>
                          }
                        />
                        {openCampaignSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItem>
                    </Tooltip>
                    <Collapse
                      in={openCampaignSubmenu}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        backgroundColor: theme.mode === "light" ? "rgba(120,120,120,0.1)" : "rgba(120,120,120,0.5)",
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/campaigns"
                          primary={i18n.t("campaigns.subMenus.list")}
                          icon={<ListIcon />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/contact-lists"
                          primary={i18n.t("campaigns.subMenus.listContacts")}
                          icon={<PeopleIcon />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/campaigns-config"
                          primary={i18n.t("campaigns.subMenus.settings")}
                          icon={<SettingsOutlinedIcon />}
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              /> */}

              {/* Menu Informativos movido para dentro do submenu Mais Opções */}
            </>
          )}
        />
        {!collapsed && (
          <React.Fragment>
            {/* Removido o Divider */}
            {/* 
                // IMAGEM NO MENU
                <Hidden only={['sm', 'xs']}>
                  <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
                </Hidden> 
                */}
            {/* Removida a exibição da versão */}
          </React.Fragment>
        )}
    </div>
  );
};

export default MainListItems;
