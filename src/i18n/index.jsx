import arMessages from './messages/ar.json';
// no need to import en messages-- they are in the defaultMessage field
import deMessages from './messages/de_DE.json';
import es419Messages from './messages/es_419.json';
import frMessages from './messages/fr.json';
import frCAMessages from './messages/fr_CA.json';
import frFRMessages from './messages/fr_FR.json';
import itITMessages from './messages/it_IT.json';
import plMessages from './messages/pl.json';
import trTRMessages from './messages/tr_TR.json';
import zhcnMessages from './messages/zh_CN.json';

const messages = {
  ar: arMessages,
  de: deMessages,
  'es-419': es419Messages,
  fr: frMessages,
  'fr-ca': frCAMessages,
  'fr-fr': frFRMessages,
  'it-it': itITMessages,
  pl: plMessages,
  'tr-tr': trTRMessages,
  'zh-cn': zhcnMessages,
};

export default messages;
