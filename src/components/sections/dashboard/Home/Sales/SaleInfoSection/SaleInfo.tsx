import { ReactElement } from 'react';
import { Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import { currencyFormat, numberFormat } from 'helpers/format-functions';

type SaleInfoProps = {
  image?: string;
  title: string;
  sales: number;
  increment: number;
  date?: string;
  formatAsCurrency?: boolean;
};

const SaleInfo = ({
  image,
  title,
  sales,
  increment,
  date,
  formatAsCurrency = true,
}: SaleInfoProps): ReactElement => {
  return (
    <Card
      sx={(theme) => ({
        boxShadow: theme.shadows[4],
        width: 1,
        height: 'auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing(2.5),
        gap: theme.spacing(2),
      })}
    >
      <CardMedia
        sx={{
          width: 70,
          height: 70,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image src={`${image}`} width={70} height={70} />
      </CardMedia>
      <CardContent
        sx={{
          flex: '1 1 auto',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          ':last-child': {
            paddingBottom: 0,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" component="p" minWidth={100} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" component="p" color="text.secondary">
            {date}
          </Typography>
        </Stack>
        <Typography variant="body1" component="p" color="text.secondary">
          {formatAsCurrency ? currencyFormat(sales) : numberFormat(sales)}
        </Typography>
        {increment > 0 && (
          <Typography
            variant="body2"
            color="primary.main"
            display="flex"
            alignItems="center"
            gap={1}
            whiteSpace={'nowrap'}
          >
            <IconifyIcon icon="ph:trend-up-fill" width={16} height={16} />
            {`+${increment}%`} last month
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SaleInfo;
