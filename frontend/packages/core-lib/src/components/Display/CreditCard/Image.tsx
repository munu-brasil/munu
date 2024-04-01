import React from 'react';
import CCAmex from './CCAmex';
import CCDiners from './CCDiners';
import CCDiscover from './CCDiscover';
import CCElo from './CCElo';
import CCGeneric from './CCGeneric';
import CCHiperCard from './CCHiperCard';
import CCJCB from './CCJCB';
import CCMaestro from './CCMaestro';
import CCMasterCard from './CCMasterCard';
import CCUnionPay from './CCUnionPay';
import CCVisa from './CCVisa';

export default ({
  creditcard,
  height = 75,
  width = 100,
}: {
  creditcard: string;
  height?: number | string;
  width?: number | string;
}) => {
  const ccsIcons: { [k: string]: React.ReactElement } = {
    visa: <CCVisa width={width} height={height} />,
    mastercard: <CCMasterCard width={width} height={height} />,
    discover: <CCDiscover width={width} height={height} />,
    amex: <CCAmex width={width} height={height} />,
    jcb: <CCJCB width={width} height={height} />,
    dinersclub: <CCDiners width={width} height={height} />,
    maestro: <CCMaestro width={width} height={height} />,
    laser: <CCGeneric width={width} height={height} />,
    unionpay: <CCUnionPay width={width} height={height} />,
    elo: <CCElo width={width} height={height} />,
    hipercard: <CCHiperCard width={width} height={height} />,
  };
  return ccsIcons[creditcard] ?? CCGeneric;
};
