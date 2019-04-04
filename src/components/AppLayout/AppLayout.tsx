import React, { Component } from 'react';
import { Typography, AppBar, Toolbar, IconButton, InputBase, Avatar, ListItemText, Divider, List, ListItemIcon, Hidden, Drawer, ListSubheader, ListItemAvatar, withStyles, Menu, MenuItem, ClickAwayListener, Badge } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MailIcon from '@material-ui/icons/Mail';
import HomeIcon from '@material-ui/icons/Home';
import DomainIcon from '@material-ui/icons/Domain';
import PublicIcon from '@material-ui/icons/Public';
import GroupIcon from '@material-ui/icons/Group';
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from '@material-ui/icons/Info';
import EditIcon from '@material-ui/icons/Edit';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {styles} from './AppLayout.styles';
import { UAccount } from '../../types/Account';
import {LinkableListItem, LinkableIconButton, LinkableFab} from '../../interfaces/overrides';
import Mastodon from 'megalodon';
import { Notification } from '../../types/Notification';
import {sendNotificationRequest} from '../../utilities/notifications';

interface IAppLayoutState {
    acctMenuOpen: boolean;
    drawerOpenOnMobile: boolean;
    currentUser: UAccount;
    notificationCount: number;
}

export class AppLayout extends Component<any, IAppLayoutState> {
    
    client: Mastodon;
    streamListener: any;

    constructor(props: any) {
        super(props);

        let accountData = JSON.parse(localStorage.getItem('account') as string);

        this.client = new Mastodon(localStorage.getItem('access_token') as string, localStorage.getItem('baseurl') as string + "/api/v1");
    
        this.state = {
          drawerOpenOnMobile: false,
          acctMenuOpen: false,
          currentUser: accountData,
          notificationCount: 0
        }
    
        this.toggleDrawerOnMobile = this.toggleDrawerOnMobile.bind(this);
        this.toggleAcctMenu = this.toggleAcctMenu.bind(this);
      }

      componentDidMount() {
        this.streamListener = this.client.stream('/streaming/user');

        this.streamListener.on('notification', (notif: Notification) => {
          const notificationCount = this.state.notificationCount + 1;
          this.setState({ notificationCount });
          if (!document.hasFocus()) {
            let primaryMessage = "";
            let secondaryMessage = "";

            switch(notif.type) {
              case "favourite":
                primaryMessage = (notif.account.display_name || "@" + notif.account.username) + " favorited your post.";
                if (notif.status) {
                  const div = document.createElement('div');
                  div.innerHTML = notif.status.content;
                  secondaryMessage = (div.textContent || div.innerText || "").slice(0, 100) + "..."
                }
                break;
              case "follow":
                primaryMessage = (notif.account.display_name || "@" + notif.account.username) + " is now following you.";
                break;
              case "mention":
                primaryMessage = (notif.account.display_name || "@" + notif.account.username) + " mentioned you in a post.";
                if (notif.status) {
                  const div = document.createElement('div');
                  div.innerHTML = notif.status.content;
                  secondaryMessage = (div.textContent || div.innerText || "").slice(0, 100) + "..."
                }
                break;
              case "reblog":
                primaryMessage = (notif.account.display_name || "@" + notif.account.username) + " reblogged your post.";
                if (notif.status) {
                  const div = document.createElement('div');
                  div.innerHTML = notif.status.content;
                  secondaryMessage = (div.textContent || div.innerText || "").slice(0, 100) + "..."
                }
                break;
            }

            sendNotificationRequest(primaryMessage, secondaryMessage);
          }
        });
      }

      toggleAcctMenu() {
        this.setState({ acctMenuOpen: !this.state.acctMenuOpen });
      }

      toggleDrawerOnMobile() {
        this.setState({
          drawerOpenOnMobile: !this.state.drawerOpenOnMobile
        })
      }

      searchForQuery(what: string) {
        window.location.href = "/#/search?query=" + what;
        window.location.reload;
      }

      titlebar() {
        const { classes } = this.props;
        if (process.env.NODE_ENV === "development") {
          return (
            <div className={classes.titleBarRoot}>
              <Typography className={classes.titleBarText}>Careful: you're running in developer mode.</Typography>
            </div>
          );
        } else if ((navigator.userAgent.includes("Hyperspace") || navigator.userAgent.includes("Electron")) && navigator.userAgent.includes("Macintosh")) {
          return (
            <div className={classes.titleBarRoot}>
              <Typography className={classes.titleBarText}>Hyperspace</Typography>
            </div>
          );
        }
      }

      appDrawer() {
        const { classes } = this.props;
        return (
          <div>
              <List>
                <div className={classes.drawerDisplayMobile}>
                  <LinkableListItem button key="profile-mobile" to={`/profile/${this.state.currentUser.id}`}>
                    <ListItemAvatar>
                      <Avatar alt="You" src={this.state.currentUser.avatar_static}/>
                    </ListItemAvatar>
                    <ListItemText primary={this.state.currentUser.display_name} secondary={this.state.currentUser.acct}/>
                  </LinkableListItem>
                  <LinkableListItem button key="notifications-mobile" to="/notifications">
                    <ListItemIcon><NotificationsIcon/></ListItemIcon>
                    <ListItemText primary="Notifications"/>
                  </LinkableListItem>
                  <LinkableListItem button key="messages-mobile" to="/messages">
                    <ListItemIcon><MailIcon/></ListItemIcon>
                    <ListItemText primary="Messages"/>
                  </LinkableListItem>
                  <LinkableListItem button key="acctSwitch-module" to="/switchacct">
                    <ListItemIcon><SupervisedUserCircleIcon/></ListItemIcon>
                    <ListItemText primary="Switch account"/>
                  </LinkableListItem>
                  <LinkableListItem button key="acctLogout-mobile" to="/logout">
                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                    <ListItemText primary="Log out"/>
                  </LinkableListItem>
                  <Divider/>
                </div>
                <ListSubheader>Timelines</ListSubheader>
                <LinkableListItem button key="home" to="/home">
                  <ListItemIcon><HomeIcon/></ListItemIcon>
                  <ListItemText primary="Home"/>
                </LinkableListItem>
                <LinkableListItem button key="local" to="/local">
                  <ListItemIcon><DomainIcon/></ListItemIcon>
                  <ListItemText primary="Local"/>
                </LinkableListItem>
                <LinkableListItem button key="public" to="/public">
                  <ListItemIcon><PublicIcon/></ListItemIcon>
                  <ListItemText primary="Public"/>
                </LinkableListItem>
                <Divider/>
                <ListSubheader>More</ListSubheader>
                <LinkableListItem button key="recommended" to="/recommended">
                  <ListItemIcon><GroupIcon/></ListItemIcon>
                  <ListItemText primary="Who to follow"/>
                </LinkableListItem>
                <LinkableListItem button key="settings" to="/settings">
                  <ListItemIcon><SettingsIcon/></ListItemIcon>
                  <ListItemText primary="Settings"/>
                </LinkableListItem>
                <LinkableListItem button key="info" to="/about">
                  <ListItemIcon><InfoIcon/></ListItemIcon>
                  <ListItemText primary="About"/>
                </LinkableListItem>
              </List>
          </div>
          );
    }

  render() {
    const { classes } = this.props;
    return (
        <div className={classes.root}>
        <div className={classes.stickyArea}>
          {this.titlebar()}
          <AppBar className={classes.appBar} position="static">
            <Toolbar>
              <IconButton
                className={classes.appBarMenuButton} 
                color="inherit" 
                aria-label="Open drawer"
                onClick={this.toggleDrawerOnMobile}
              >
                <MenuIcon/>
              </IconButton>
              <Typography className={classes.appBarTitle} variant="h6" color="inherit" noWrap>
                Hyperspace
              </Typography>
              <div className={classes.appBarFlexGrow}/>
              <div className={classes.appBarSearch}>
                <div className={classes.appBarSearchIcon}>
                  <SearchIcon/>
                </div>
                <InputBase
                  placeholder="Search..."
                  classes={{
                    root: classes.appBarSearchInputRoot,
                    input: classes.appBarSearchInputInput
                  }}
                  onKeyUp={(event) => {
                    if (event.keyCode === 13) {
                      this.searchForQuery(event.currentTarget.value);
                    }
                  }}
                />
              </div>
              <div className={classes.appBarFlexGrow}/>
              <div className={classes.appBarActionButtons}>
                  <LinkableIconButton color="inherit" to="/notifications" onClick={() => this.setState({ notificationCount: 0 })}>
                    <Badge badgeContent={this.state.notificationCount > 0? this.state.notificationCount: ""} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </LinkableIconButton>
                  <LinkableIconButton color="inherit" to="/messages">
                    <MailIcon/>
                  </LinkableIconButton>
                  <IconButton id="acctMenuBtn" onClick={this.toggleAcctMenu}>
                    <Avatar className={classes.appBarAcctMenuIcon} alt="You" src={this.state.currentUser.avatar_static}/>
                  </IconButton>
                  <Menu
                    id="acct-menu"
                    anchorEl={document.getElementById("acctMenuBtn")}
                    open={this.state.acctMenuOpen}
                    className={classes.acctMenu}
                  >
                    <ClickAwayListener onClickAway={this.toggleAcctMenu}>
                      <div>
                        <LinkableListItem to={`/profile/${this.state.currentUser.id}`}>
                            <ListItemAvatar>
                              <Avatar alt="You" src={this.state.currentUser.avatar_static}/>
                            </ListItemAvatar>
                            <ListItemText primary={this.state.currentUser.display_name || this.state.currentUser.acct} secondary={'@' + this.state.currentUser.acct}/>
                        </LinkableListItem>
                        <Divider/>
                        <MenuItem>Switch account</MenuItem>
                        <MenuItem>Log out</MenuItem>                      
                      </div>
                    </ClickAwayListener>
                  </Menu>
              </div>
            </Toolbar>
          </AppBar>
          <nav className={classes.drawer}>
            <Hidden mdUp implementation="css">
                <Drawer
                  container={this.props.container}
                  variant="temporary"
                  anchor={'left'}
                  open={this.state.drawerOpenOnMobile}
                  onClose={this.toggleDrawerOnMobile}
                  classes={{ paper: classes.drawerPaper }}
                >
                  {this.appDrawer()}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer 
                  classes={{ 
                    paper: this.titlebar()? classes.drawerPaperWithTitleAndAppBar: classes.drawerPaperWithAppBar
                  }} 
                  variant="permanent" 
                  open
                >
                  {this.appDrawer()}
                </Drawer>
            </Hidden>
          </nav>
        </div>
        <LinkableFab to="/compose" className={classes.composeButton} color="secondary" aria-label="Compose">
          <EditIcon/>
        </LinkableFab>
    </div>
    );
  }
}

export default withStyles(styles)(AppLayout);