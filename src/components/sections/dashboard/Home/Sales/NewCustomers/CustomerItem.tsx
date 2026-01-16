import { Avatar, IconButton, Link, ListItem, Stack, Tooltip, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ReactElement } from 'react';

type CustomerItemProps = {
  name: string;
  email: string;
  avatar?: string;
};

const CustomerItem = ({ name, email, avatar }: CustomerItemProps): ReactElement => {
  const firstName = name.split(' ')[0];
  return (
    <ListItem
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.spacing(1.25, 2.5),
      })}
    >
      <Stack direction="row" gap={1.5} component={Link}>
        <Tooltip title={firstName} placement="top" arrow enterDelay={0} leaveDelay={0}>
          <Avatar src={avatar}>
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
        <Stack component="div">
          <Typography variant="body1" color="text.primary">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Stack>
      </Stack>
      <Tooltip title={email} placement="left" arrow>
        <IconButton>
          <IconifyIcon icon="mingcute:mail-fill" color="primary.main" width={16} height={16} />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
};

export default CustomerItem;
