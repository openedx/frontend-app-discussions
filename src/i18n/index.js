import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as headerMessages } from '@edx/frontend-component-header';
import { messages as paragonMessages } from '@edx/paragon';

import arMessages from './messages/ar.json';
// no need to import en messages-- they are in the defaultMessage field
import csMessages from './messages/cs.json';
import deMessages from './messages/de_DE.json';
import es419Messages from './messages/es_419.json';
import esARMessages from './messages/es_AR.json';
import esESMessages from './messages/es_ES.json';
import faIRMessages from './messages/fa_IR.json';
import frMessages from './messages/fr.json';
import frCAMessages from './messages/fr_CA.json';
import frFRMessages from './messages/fr_FR.json';
import hiMessages from './messages/hi.json';
import itITMessages from './messages/it_IT.json';
import plMessages from './messages/pl.json';
import ptPTMessages from './messages/pt_PT.json';
import ruMessages from './messages/ru.json';
import trTRMessages from './messages/tr_TR.json';
import ukMessages from './messages/uk.json';
import zhcnMessages from './messages/zh_CN.json';

const appMessages = {
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
  'pt-pt': ptPTMessages,
  uk: ukMessages,
  ru: ruMessages,
  hi: hiMessages,
  cs: csMessages,
  'es-AR': esARMessages,
  'es-ES': esESMessages,
  'fa-IR': faIRMessages,
};

export default [
  headerMessages,
  footerMessages,
  paragonMessages,
  appMessages,
];
