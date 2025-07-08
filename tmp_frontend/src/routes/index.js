import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useMediaQuery } from "@material-ui/core";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Signup from "../pages/Signup";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import SettingsCustom from "../pages/SettingsCustom/";
import Financeiro from "../pages/Financeiro/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import ContactImportPage from "../pages/Contacts/import";
import ChatMoments from "../pages/Moments"
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import MessagesAPI from "../pages/MessagesAPI/";
import HelpPage from "../HelpPage/";
import Helps from "../pages/Helps/";
// import HelpPage from "../HelpPage/HelpPage.js";
import Campaigns from "../pages/Campaigns";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Chat from "../pages/Chat";
import Prompts from "../pages/Prompts";
import AllConnections from "../pages/AllConnections/";
import Reports from "../pages/Reports";
import ConfirmPage from "../pages/ConfirmPage/";
//import ToDoList from "../pages/ToDoList/";
// import Integrations from '../pages/Integrations';
// import GoogleCalendarComponent from '../pages/Integrations/components/GoogleCalendarComponent';

import Subscription from "../pages/Subscription/";
import QueueIntegration from "../pages/QueueIntegration";
import Files from "../pages/Files/";
import ToDoList from "../pages/ToDoList/";
import Kanban from "../pages/Kanban";
import TagsKanban from "../pages/TagsKanban";
import PasswordReset from "../pages/PasswordReset";

import { AuthProvider } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import Schedules from "../pages/Schedules";
import ContactLists from "../pages/ContactLists/";
import ContactListItems from "../pages/ContactListItems/";
import Companies from "../pages/Companies/";
import QuickMessages from "../pages/QuickMessages/";
import Typebot from "../pages/Typebot/";


const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  // Função para verificar se deve redirecionar para tickets em dispositivos móveis
  const MobileRedirect = ({ children }) => {
    if (isMobile) {
      return <Redirect to="/tickets" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketsContextProvider>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/recovery-password" component={PasswordReset} />
            <WhatsAppsProvider>
              <LoggedInLayout>
                {/* Redirecionamento para tickets em dispositivos móveis */}
                <Route exact path="/" render={() => isMobile ? <Redirect to="/tickets" /> : <Dashboard />} isPrivate />
                
                <Route exact path="/financeiro" render={() => (
                  <MobileRedirect>
                    <Financeiro />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/companies" render={() => (
                  <MobileRedirect>
                    <Companies />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} isPrivate />
                
                <Route exact path="/connections" render={() => (
                  <MobileRedirect>
                    <Connections />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/quick-messages" render={() => (
                  <MobileRedirect>
                    <QuickMessages />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/todolist" render={() => (
                  <MobileRedirect>
                    <ToDoList />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/schedules" render={() => (
                  <MobileRedirect>
                    <Schedules />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/tags" render={() => (
                  <MobileRedirect>
                    <Tags />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/contacts" render={() => (
                  <MobileRedirect>
                    <Contacts />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/contacts/import" component={ContactImportPage} isPrivate />

                <Route exact path="/helps" render={() => (
                  <MobileRedirect>
                    <Helps />
                  </MobileRedirect>
                )} isPrivate />

                {/* Rota para a página de ajuda com iframe */}
                <Route exact path="/ajuda" render={() => (
                  <MobileRedirect>
                    <HelpPage />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/users" render={() => (
                  <MobileRedirect>
                    <Users />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/messages-api" render={() => (
                  <MobileRedirect>
                    <MessagesAPI />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/settings" render={() => (
                  <MobileRedirect>
                    <SettingsCustom />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/queues" render={() => (
                  <MobileRedirect>
                    <Queues />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/reports" render={() => (
                  <MobileRedirect>
                    <Reports />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/queue-integration" render={() => (
                  <MobileRedirect>
                    <QueueIntegration />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/announcements" render={() => (
                  <MobileRedirect>
                    <Annoucements />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/chats/:id?" render={() => (
                  <MobileRedirect>
                    <Chat />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/files" render={() => (
                  <MobileRedirect>
                    <Files />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/moments" render={() => (
                  <MobileRedirect>
                    <ChatMoments />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/Kanban" render={() => (
                  <MobileRedirect>
                    <Kanban />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/TagsKanban" render={() => (
                  <MobileRedirect>
                    <TagsKanban />
                  </MobileRedirect>
                )} isPrivate />
                
                <Route exact path="/prompts" render={() => (
                  <MobileRedirect>
                    <Prompts />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/allConnections" render={() => (
                  <MobileRedirect>
                    <AllConnections />
                  </MobileRedirect>
                )} isPrivate />

                <Route exact path="/typebot" render={() => (
                  <MobileRedirect>
                    <Typebot />
                  </MobileRedirect>
                )} isPrivate />

                {showCampaigns && (
                  <>
                    <Route exact path="/contact-lists" render={() => (
                      <MobileRedirect>
                        <ContactLists />
                      </MobileRedirect>
                    )} isPrivate />
                    <Route exact path="/contact-lists/:contactListId/contacts" render={() => (
                      <MobileRedirect>
                        <ContactListItems />
                      </MobileRedirect>
                    )} isPrivate />
                    <Route exact path="/campaigns" render={() => (
                      <MobileRedirect>
                        <Campaigns />
                      </MobileRedirect>
                    )} isPrivate />
                    <Route exact path="/campaign/:campaignId/report" render={() => (
                      <MobileRedirect>
                        <CampaignReport />
                      </MobileRedirect>
                    )} isPrivate />
                    <Route exact path="/campaigns-config" render={() => (
                      <MobileRedirect>
                        <CampaignsConfig />
                      </MobileRedirect>
                    )} isPrivate />
                  </>
                )}
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer position="top-center" autoClose={3000} />
        </TicketsContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
