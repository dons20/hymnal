import { createMuiTheme } from "@material-ui/core/styles";
import deepPurple from "@material-ui/core/colors/deepPurple";
import blue from "@material-ui/core/colors/blue";

const theme = createMuiTheme({
    palette: {
        primary: blue,
        secondary: deepPurple
    }
});

export default theme;
