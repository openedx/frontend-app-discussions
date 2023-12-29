import { messages as paragonMessages } from '@openedx/paragon';

import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as headerMessages } from '@edx/frontend-component-header';

import arMessages from './messages/ar.json';
import csMessages from './messages/cs.json';
import deDEMessages from './messages/de_DE.json';
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
import zhCNMessages from './messages/zh_CN.json';
// no need to import en messages-- they are in the defaultMessage field

const appMessages = {
  ar: arMessages,
  cs: csMessages,
  'de-de': deDEMessages,
  'es-419': es419Messages,
  'es-ar': esARMessages,
  'es-es': esESMessages,
  'fa-ir': faIRMessages,
  fr: frMessages,
  'fr-ca': frCAMessages,
  'fr-fr': frFRMessages,
  hi: hiMessages,
  'it-it': itITMessages,
  pl: plMessages,
  'pt-pt': ptPTMessages,
  'tr-tr': trTRMessages,
  uk: ukMessages,
  ru: ruMessages,
  'zh-cn': zhCNMessages,
};

export default [
  headerMessages,
  footerMessages,
  paragonMessages,
  appMessages,
];
