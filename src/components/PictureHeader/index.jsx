import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Paper } from "@material-ui/core";

const imgPath = process.env.PUBLIC_URL + "/rainbow/";

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.light,
        color: "#FFF"
    },
    hCont: {
        alignItems: "center",
        backgroundColor: "rgba(0, 12, 23, 0.63)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center"
    },
    hr: {
        width: "25%"
    },
    heading: {
        color: "#FFF"
    },
    card: {
        margin: `${theme.spacing(2)}px auto`,
        minWidth: 250,
        width: "calc(1/3*100% - (1 - 1/3)*10px)"
    },
    media: {
        height: 150
    },
    title: {
        fontSize: 14
    },
    pos: {
        marginBottom: 12
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gridGap: "30px"
    },
    wrapper: {
        margin: "0 auto",
        width: "90%"
    },
    action: {
        marginLeft: "auto"
    },
    bgImgCont: {
        backgroundSize: "cover",
        backgroundPosition: "bottom center",
        backgroundRepeat: "no-repeat",
        display: "block",
        height: "25vh",
        position: "relative",
        width: "100%"
    },
    bgImg: {
        display: "none"
    }
});

function PictureHeader(props) {
    const { classes } = props;
    let img = null,
        src = "";

    function update(e) {
        img = e;
        let thisSrc = img.getAttribute("src");
        if (src !== thisSrc) {
            src = thisSrc;
            img.parentElement.style.backgroundImage = `url("${src}")`;
        }
    }

    return (
        <Paper className={classes.root} elevation={3}>
            <div className={classes.bgImgCont}>
                <img
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    srcSet={`
                        ${imgPath}rainbow_rg388g_c_scale,w_200.jpg 200w,
                        ${imgPath}rainbow_rg388g_c_scale,w_554.jpg 554w,
                        ${imgPath}rainbow_rg388g_c_scale,w_807.jpg 807w,
                        ${imgPath}rainbow_rg388g_c_scale,w_999.jpg 999w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1177.jpg 1177w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1324.jpg 1324w,
                        ${imgPath}rainbow_rg388g_c_scale,w_1400.jpg 1400w
                    `}
                    src={`${imgPath}rainbow_rg388g_c_scale,w_1400.jpg`}
                    alt="Rainbow Background"
                    className={classes.bgImg}
                    onLoad={e => update(e.target)}
                />
                <div className={classes.hCont}>
                    {props.title && (
                        <Typography className={classes.heading} variant="h4">
                            {props.title}
                        </Typography>
                    )}
                    <hr className={classes.hr} />
                    {props.subtitle && (
                        <Typography className={classes.heading} variant="h6">
                            {props.subtitle}
                        </Typography>
                    )}
                </div>
            </div>
        </Paper>
    );
}

PictureHeader.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PictureHeader);
