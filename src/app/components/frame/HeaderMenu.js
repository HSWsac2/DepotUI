import { AddBox, Person } from '@mui/icons-material';
import Logout from '@mui/icons-material/Logout';
import Settings from '@mui/icons-material/Settings';
import { CircularProgress, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import { UserContext } from '../../../context/UserContext';
import useAxios from '../../hooks/useAxios';
import { DropdownMenu } from './DropdownMenu';

export default function HeaderMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const [, , removeUserCookie] = useCookies(['user']);

    const { response, error, loading } = useAxios({
        url: `http://localhost:8080/api/depotService/deposits/${currentUser?.client_id}`,
        method: 'get',
        baseUrl: '',
        active: currentUser?.client_id != null,
    });
    // simply throw the error (for now)
    if (error) {
        throw error;
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleLogout = () => {
        setCurrentUser(null)
        removeUserCookie("user");
        console.log(removeUserCookie)
    }

    // TODO move to context
    const [selectedDeposit, setSelectedDeposit] = useState(null);

    return (
        <>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Typography color="white">
                        {selectedDeposit ? `${selectedDeposit.position_id} ${selectedDeposit.position_sub_id}` : "Depotauswahl"}
                    </Typography>
                    <Avatar sx={{ width: 32, height: 32, ml: 1 }}>
                        <Person />
                    </Avatar>

                </IconButton>
            </Tooltip>
            <DropdownMenu
                anchorEl={anchorEl}
                open={open}
                setAnchorEl={setAnchorEl}
                menuId='account-menu'
            >
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '10px' }}>
                        <CircularProgress />
                    </div>
                )}
                {response && response.map(deposit => (
                    <MenuItem 
                        key={deposit.position_id + deposit.position_sub_id}
                        onClick={() => setSelectedDeposit(deposit)}
                        >
                        {/* Will be the deposit name soon */}
                        <Avatar></Avatar>{deposit.position_id} {deposit.position_sub_id}
                    </MenuItem>
                ))}

                <Divider />
                <MenuItem>
                    <ListItemIcon>
                        <AddBox fontSize="small" />
                    </ListItemIcon>
                    Depot erstellen
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Einstellungen
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </DropdownMenu>
        </>
    );
}