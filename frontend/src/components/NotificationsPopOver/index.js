import React, { useState, useRef, useEffect, useContext } from "react";
import { useTheme } from "@material-ui/core/styles";

import { useHistory } from "react-router-dom";
import { format } from "date-fns";
// import { SocketContext } from "../../context/Socket/SocketContext";

import useSound from "use-sound";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import ChatIcon from "@material-ui/icons/Chat";

import TicketListItem from "../TicketListItem";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import Favicon from "react-favicon";
import { getBackendUrl } from "../../config";
import defaultLogoFavicon from "../../assets/favicon.ico";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const useStyles = makeStyles(theme => ({
	tabContainer: {
		overflowY: "auto",
		maxHeight: 350,
		...theme.scrollbarStyles,
	},
	popoverPaper: {
		width: "100%",
		maxWidth: 350,
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(1),
		[theme.breakpoints.down("sm")]: {
			maxWidth: 270,
		},
	},
	noShadow: {
		boxShadow: "none !important",
	},
}));

const NotificationsPopOver = (volume) => {
	const classes = useStyles();
	const theme = useTheme();

	const history = useHistory();
	// const socketManager = useContext(SocketContext);
	const { user, socket } = useContext(AuthContext);
	const { profile, queues } = user;

	const ticketIdUrl = +history.location.pathname.split("/")[2];
	const ticketIdRef = useRef(ticketIdUrl);
	const anchorEl = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const queueIds = queues.map((q) => q.id);
	const { get: getSetting } = useCompanySettings();
    const { setCurrentTicket, setTabOpen } = useContext(TicketsContext);

	const [showTicketWithoutQueue, setShowTicketWithoutQueue] = useState(false);
	const [showNotificationPending, setShowNotificationPending] = useState(false);
	const [showGroupNotification, setShowGroupNotification] = useState(false);

	const [, setDesktopNotifications] = useState([]);

	const { tickets } = useTickets({
		withUnreadMessages: "true"
		// showAll: showTicketWithoutQueue ? "true" : "false"
	});

	const [play] = useSound(alertSound, volume);
	const soundAlertRef = useRef();

	const historyRef = useRef(history);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const setting = await getSetting(
					{
						"column": "showNotificationPending"
					}
				);



				if (setting.showNotificationPending === true) {
					setShowNotificationPending(true);
				}

				if (user.allTicket === "enable") {
					setShowTicketWithoutQueue(true);
				}
				if (user.allowGroup === true) {
					setShowGroupNotification(true);
				}
			} catch (err) {
				toastError(err);
			}
		}

		fetchSettings();
	}, [setShowTicketWithoutQueue, setShowNotificationPending]);

	useEffect(() => {
		soundAlertRef.current = play;

		if (!("Notification" in window)) {
			console.log("This browser doesn't support notifications");
		} else {
			Notification.requestPermission();
		}
	}, [play]);

	useEffect(() => {
		const processNotifications = () => {
			// if (showTicketWithoutQueue) {
			setNotifications(tickets);
			// } else {
			// 	const newNotifications = tickets.filter(ticket => ticket.status !== "pending");

			// 	setNotifications(newNotifications);
			// }
		}

		processNotifications();
	}, [tickets]);

	useEffect(() => {
		ticketIdRef.current = ticketIdUrl;
	}, [ticketIdUrl]);

	useEffect(() => {
		const companyId = user.companyId;
		// const socket = socketManager.GetSocket();
		if (user.id) {
			const queueIds = queues.map((q) => q.id);

			const onConnectNotificationsPopover = () => {
				socket.emit("joinNotification");
			}

			const onCompanyTicketNotificationsPopover = (data) => {
				if (data.action === "updateUnread" || data.action === "delete") {
					setNotifications(prevState => {
						const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
						if (ticketIndex !== -1) {
							prevState.splice(ticketIndex, 1);
							return [...prevState];
						}
						return prevState;
					});

					setDesktopNotifications(prevState => {
						const notfiticationIndex = prevState.findIndex(
							n => n.tag === String(data.ticketId)
						);
						if (notfiticationIndex !== -1) {
							prevState[notfiticationIndex].close();
							prevState.splice(notfiticationIndex, 1);
							return [...prevState];
						}
						return prevState;
					});
				}
			};

			const onCompanyAppMessageNotificationsPopover = (data) => {
				// if (
				// 	data.action === "create" && !data.message.fromMe &&
				// 	(
				// 		data.ticket.status !== 'pending' &&
				// 		data.ticket.status !== "lgpd" &&
				// 		data.ticket.status !== "nps"						
				// 	) &&
				// 	(!data.message.read || (data.ticket.status === "pending" && showTicketWithoutQueue && data.ticket.queueId === null) || (data.ticket.status === "pending" && !showTicketWithoutQueue && user?.queues?.some(queue => (queue.id === data.ticket.queueId)))) &&
				// 	(data.ticket.userId === user?.id || !data.ticket.userId)
				// ) {
				// 
				
				if (
					data.action === "create" && !data.message.fromMe &&
					!data.message.read &&
					(data.ticket?.userId === user?.id || !data.ticket?.userId) &&
					(user?.queues?.some(queue => (queue.id === data.ticket.queueId)) ||
						!data.ticket.queueId && showTicketWithoutQueue === true) &&
					(!["pending", "lgpd", "nps", "group"].includes(data.ticket?.status) ||
						(data.ticket?.status === "pending" && showNotificationPending === true) ||
						(data.ticket?.status === "group" && data.ticket?.whatsapp?.groupAsTicket === "enabled" && showGroupNotification === true))
				) {
					setNotifications(prevState => {
						const ticketIndex = prevState.findIndex(t => t.id === data.ticket.id);
						if (ticketIndex !== -1) {
							prevState[ticketIndex] = data.ticket;
							return [...prevState];
						}
						return [data.ticket, ...prevState];
					});

					const shouldNotNotificate =
						(data.message.ticketId === ticketIdRef.current &&
							document.visibilityState === "visible") ||
						(data.ticket.userId && data.ticket.userId !== user?.id) ||
						(data.ticket.isGroup && data.ticket?.whatsapp?.groupAsTicket === "disabled" && showGroupNotification === false);


					if (shouldNotNotificate === true) return;

					handleNotifications(data);
				}
			}

			socket.on("connect", onConnectNotificationsPopover);
			socket.on(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
			socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);

			return () => {
				socket.off("connect", onConnectNotificationsPopover);
				socket.off(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
				socket.off(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);
			};
		}
	}, [user, profile, queues, showTicketWithoutQueue, socket, showNotificationPending, showGroupNotification]);

	const handleNotifications = data => {
		const { message, contact, ticket } = data;

		const options = {
			body: `${message.body} - ${format(new Date(), "HH:mm")}`,
			icon: contact.urlPicture,
			tag: ticket.id,
			renotify: true,
		};
		const notification = new Notification(
			`${i18n.t("tickets.notification.message")} ${contact.name}`,
			options
		);

		notification.onclick = e => {
			e.preventDefault();
			window.focus();
			setTabOpen(ticket.status)
			historyRef.current.push(`/tickets/${ticket.uuid}`);
			// handleChangeTab(null, ticket.isGroup? "group" : "open");
		};

		setDesktopNotifications(prevState => {
			const notfiticationIndex = prevState.findIndex(
				n => n.tag === notification.tag
			);
			if (notfiticationIndex !== -1) {
				prevState[notfiticationIndex] = notification;
				return [...prevState];
			}
			return [notification, ...prevState];
		});
		soundAlertRef.current();
	};

	const handleClick = () => {
		setIsOpen(prevState => !prevState);
	};

	const handleClickAway = () => {
		setIsOpen(false);
	};

	const NotificationTicket = ({ children }) => {
		return <div onClick={handleClickAway}>{children}</div>;
	};

	const browserNotification = () => {
		const numbers = "⓿➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴";
		if (notifications.length > 0) {
			if (notifications.length < 21) {
				document.title = numbers.substring(notifications.length, notifications.length + 1) + " - " + (theme.appName || "...");
			} else {
				document.title = "(" + notifications.length + ")" + (theme.appName || "...");
			}
		} else {
			document.title = theme.appName || "...";
		}
		return (
			<>
				<Favicon
					animated={true}
					url={(theme?.appLogoFavicon) ? theme.appLogoFavicon : defaultLogoFavicon}
					alertCount={notifications.length}
					iconSize={195}
				/>
			</>
		);
	};

	return (
		<>
			{browserNotification()}

			<IconButton
				onClick={handleClick}
				ref={anchorEl}
				aria-label="Open Notifications"
				color="inherit"
				style={{ color: "white" }}
			>
				<Badge overlap="rectangular" badgeContent={notifications.length} color="secondary">
					<ChatIcon />
				</Badge>
			</IconButton>
			<Popover
				disableScrollLock
				open={isOpen}
				anchorEl={anchorEl.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				classes={{ paper: classes.popoverPaper }}
				onClose={handleClickAway}
			>
				<List dense className={classes.tabContainer}>
					{notifications.length === 0 ? (
						<ListItem>
							<ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
						</ListItem>
					) : (
						notifications.map(ticket => (
							<NotificationTicket key={ticket.id}>
								<TicketListItem ticket={ticket} />
							</NotificationTicket>
						))
					)}
				</List>
			</Popover>
		</>
	);
};

export default NotificationsPopOver;