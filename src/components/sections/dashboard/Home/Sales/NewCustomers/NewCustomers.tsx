import { ReactElement, useEffect, useState } from 'react';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';

import { usersService, User } from 'services/users';
import CustomerItem from './CustomerItem';

const NewCustomers = (): ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchNewUsers();
  }, []);

  const fetchNewUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await usersService.getAllUsers();
      // Get the most recent users (limit to 5)
      const sortedUsers = allUsers
        .filter((user) => !user.is_deleted && user.status?.toLowerCase() !== 'inactive')
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to fetch new users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        borderRadius: 5,
        height: 1,
        flex: '1 1 auto',
        width: { xs: 'auto', sm: 0.5, lg: 'auto' },
        boxShadow: (theme) => theme.shadows[4],
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" padding={2.5}>
        <Typography variant="subtitle1" color="text.primary">
          New Customers
        </Typography>
      </Stack>
      <Stack pb={1.25}>
        {loading ? (
          <Stack justifyContent="center" alignItems="center" py={3}>
            <CircularProgress size={24} />
          </Stack>
        ) : users.length === 0 ? (
          <Stack justifyContent="center" alignItems="center" py={3}>
            <Typography variant="body2" color="text.secondary">
              No new customers
            </Typography>
          </Stack>
        ) : (
          users.map((user) => (
            <CustomerItem
              key={user._id || user.id}
              name={user.name || 'N/A'}
              email={user.email}
              avatar={user.profile_image}
            />
          ))
        )}
      </Stack>
    </Box>
  );
};

export default NewCustomers;
