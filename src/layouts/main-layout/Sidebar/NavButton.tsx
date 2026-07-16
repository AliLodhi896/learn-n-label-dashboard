import { ReactElement, useState } from 'react';
import {
  Collapse,
  LinkTypeMap,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';
import { NavItem } from 'data/nav-items';

interface NavItemProps {
  navItem: NavItem;
  Link: OverridableComponent<LinkTypeMap>;
}

const NavButton = ({ navItem, Link }: NavItemProps): ReactElement => {
  const { pathname } = useLocation();
  const [checked, setChecked] = useState(false);
  const [nestedChecked, setNestedChecked] = useState<boolean[]>([]);
  const isActive = pathname === navItem.path;

  const handleNestedChecked = (index: any, value: boolean) => {
    const updatedBooleanArray = [...nestedChecked];
    updatedBooleanArray[index] = value;
    setNestedChecked(updatedBooleanArray);
  };

  return (
    <ListItem
      sx={{
        my: 0.5,
        p: 0,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: isActive
          ? (theme) => alpha(theme.palette.primary.main, 0.16)
          : 'transparent',
        color: isActive ? 'primary.main' : 'text.secondary',
        border: (theme) =>
          isActive
            ? `1px solid ${alpha(theme.palette.primary.main, 0.35)}`
            : '1px solid transparent',
        '&:hover': {
          backgroundColor: isActive
            ? (theme) => alpha(theme.palette.primary.main, 0.22)
            : 'action.hover',
        },
        '& .MuiListItemIcon-root': {
          color: 'inherit',
          minWidth: 36,
        },
      }}
    >
      {navItem.collapsible ? (
        <>
          <ListItemButton LinkComponent={Link} onClick={() => setChecked(!checked)}>
            <ListItemIcon>
              <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
            </ListItemIcon>
            <ListItemText
              primary={navItem.title}
              primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}
            />
            <ListItemIcon>
              {navItem.collapsible &&
                (checked ? (
                  <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                ) : (
                  <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                ))}
            </ListItemIcon>
          </ListItemButton>
          <Collapse in={checked}>
            <List>
              {navItem.sublist?.map((subListItem: any, idx: number) => (
                <ListItem
                  key={idx}
                  sx={{
                    backgroundColor: isActive
                      ? (theme) => alpha(theme.palette.primary.main, 0.1)
                      : '',
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {subListItem.collapsible ? (
                    <>
                      <ListItemButton
                        LinkComponent={Link}
                        onClick={() => {
                          handleNestedChecked(idx, !nestedChecked[idx]);
                        }}
                      >
                        <ListItemText sx={{ ml: 3.5 }}>{subListItem.title}</ListItemText>
                        <ListItemIcon>
                          {subListItem.collapsible &&
                            (nestedChecked[idx] ? (
                              <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                            ) : (
                              <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                            ))}
                        </ListItemIcon>
                      </ListItemButton>
                      <Collapse in={nestedChecked[idx]}>
                        <List>
                          {subListItem?.sublist?.map(
                            (nestedSubListItem: any, nestedIdx: number) => (
                              <ListItem key={nestedIdx}>
                                <ListItemButton
                                  LinkComponent={Link}
                                  href={
                                    navItem.path !== '/'
                                      ? navItem.path +
                                        '/' +
                                        subListItem.path +
                                        '/' +
                                        nestedSubListItem.path
                                      : nestedSubListItem.path
                                  }
                                >
                                  <ListItemText sx={{ ml: 5 }}>
                                    {nestedSubListItem.title}
                                  </ListItemText>
                                </ListItemButton>
                              </ListItem>
                            ),
                          )}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    <ListItemButton
                      LinkComponent={Link}
                      href={navItem.path + '/' + subListItem.path}
                    >
                      <ListItemText sx={{ ml: 3 }}>{subListItem.title}</ListItemText>
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </>
      ) : (
        <ListItemButton
          LinkComponent={Link}
          href={navItem.path}
          sx={{ opacity: navItem.active ? 1 : 0.55, py: 1.1 }}
        >
          <ListItemIcon>
            <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
          </ListItemIcon>
          <ListItemText
            primary={navItem.title}
            primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}
          />
        </ListItemButton>
      )}
    </ListItem>
  );
};

export default NavButton;
