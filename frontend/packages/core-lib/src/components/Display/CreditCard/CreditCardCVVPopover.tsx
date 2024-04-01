import { Card, CardContent, Typography } from '@mui/material';
import CreditCardCVV from './CreditCardCVV';
import HelpPopover from '../../HelpPopover';

const DefaultLabels = {
  title: 'O que é o Código de Verificação de Cartão (CVC)?',
  description1:
    'Valor de Verificação de Cartão (CVV), Código de Segurança de Cartão ou Código de Segurança Pessoal',
  description2:
    'O Código de Verificação de Cartão, ou CVC, é o código impresso no verso do cartão de débito ou crédito.\nNos cartões American Express (AMEX), geralmente é um código de quatro dígitos na frente do cartão',
};

export type CreditCardCVVPopoverProps = {
  lables?: {
    title?: string;
    description1?: string;
    description2?: string;
  };
};
function CreditCardCVVPopover(props: CreditCardCVVPopoverProps) {
  const { lables = DefaultLabels } = props;

  return (
    <HelpPopover title="O que é isso?">
      <Card style={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="h2">
            {lables?.title}
          </Typography>
          <Typography style={{ marginBottom: 12 }} color="textSecondary">
            {lables?.description1}
          </Typography>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Typography
              variant="body2"
              component="p"
              style={{ flex: 3, whiteSpace: 'break-spaces' }}
            >
              {lables?.description2}
            </Typography>
            <CreditCardCVV height={100} width={150} />
          </div>
        </CardContent>
      </Card>
    </HelpPopover>
  );
}

export default CreditCardCVVPopover;
