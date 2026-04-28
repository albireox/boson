import { CssBaseline, Box } from "@mui/material";
import ActiveAlerts from "./Components/ActiveAlerts";
import { BosonHeader } from "renderer/Components";
import DisabledAlertsPanel from "./Components/DisabledAlertsPanel";

export default function Alerts() {
    return (
        <Box
        component='main'
        display='flex'
        position='absolute'
        width='100%'
        top={0}>
        <CssBaseline />
        <BosonHeader/>
        <ActiveAlerts />
        <DisabledAlertsPanel />
        </Box>
    )
}
