import React, { useEffect } from "react";

import { Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		// backgroundColor: "#eee",
		background: theme.palette.total,
		flex: "none",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		height: "65px",
		[theme.breakpoints.down("sm")]: {
			flexWrap: "wrap",
			height: 'max-content'
		},
	},
}));

const TicketHeader = ({ loading, children }) => {
	const classes = useStyles();
	const history = useHistory();

	const handleBack = () => {

		history.push("/tickets");
	};

	// useEffect(() => {
	// 	const handleKeyDown = (event) => {
	// 		if (event.key === "Escape") {
	// 			handleBack();
	// 		}
	// 	};
	// 	document.addEventListener("keydown", handleKeyDown);
	// 	return () => {
	// 		document.removeEventListener("keydown", handleKeyDown);
	// 	};
	// }, [history]);

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card
					square
					className={classes.ticketHeader}
				>
					<Button color="primary" onClick={handleBack}>
						<ArrowBackIos />
					</Button>
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
