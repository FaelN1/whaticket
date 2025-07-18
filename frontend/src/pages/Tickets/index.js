import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		// padding: theme.spacing(4),
		padding: theme.padding,
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
	},

	chatPapper: {
		// backgroundColor: "red",
		display: "flex",
		height: "100%",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		// backgroundColor: "#eee",
		background: theme.palette.tabHeaderBackground,
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	logo: {
		logo: theme.logo,
		content: "url(" + ((theme.appLogoLight || theme.appLogoDark) ? getBackendUrl() + "/public/" + (theme.mode === "light" ? theme.appLogoLight || theme.appLogoDark : theme.appLogoDark || theme.appLogoLight) : (theme.mode === "light" ? logo : logoDark)) + ")"
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<Ticket />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>
									<center>
										<img className={classes.logo} width="50%" alt="" />
									</center>
									{i18n.t("chat.noTicketMessage")}
								</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
