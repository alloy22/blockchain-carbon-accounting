import { WsWallet } from '../src/wallet';
import { keyGen, getPubKeyHex, listKeys, IClientNewKey } from '../src/key';
import axios from 'axios';
import { IWebSocketKey } from '../src/wallet'
let usage = '\nUsage: ws-wallet\n';
usage +=
  '\tnew-key <keyname> [<curve>]\t' +
  "\tGenerate new key with curve: 'p256' | 'p384'\n";
usage += '\tget-pkh <keyname>\t' + '\t\tGet public key hex of keyname\n';
usage += '\topen <keyname> <endpoint> [<sslStrict>] \t' + 'Open ws-identity session from host with keyname\n'; 

usage += '\tconnect <host> <sessionId> <keyname> [<sslStrict>] \t' + 'Connect to ws-identity server\n'; 
usage += '...      \t \t \t use sslStrict for testing with unverified ssl/tls certificates\n';

function showHelp() {
  console.log(usage);
  console.log('\nOptions:\r');
  console.log(
    '   \t--version\t' + 'Show version number.' + '\t\t' + '[boolean]\r',
  );
  console.log(
    '-k,\t--keys   \t' + 'List all keys.      ' + '\t\t' + '[boolean]\r',
  );
  console.log(
    '   \t--help   \t' + 'Show help.          ' + '\t\t' + '[boolean]\n',
  );
}


  /**
   * @description request new session with ws-identity server (identity proxy 
   * to communicate with Fabric application) and webSocketKey for the session
   * @param userId : name of key file stored by ws-wallet locally 
   * also sets the userID fof storing the WS-X.509 certificate enrolled with Fabric;
   * @param endpoint: url to access the API provide by Fabric applicaiton 
   * to request a new ws-identity session ticket
   * @return IWebSocketKey: the key needed to access the open web-socket conneciton
   * @note the session ticket must be requested by the Fabric app that will use it
   * because the ws-identity server matches the IP used to request the ticket with
   * the IP connecting to it later (so that other apps can't use the same session)
   * To open a webSocketKey the ws-wallet makes a REST request to trigger the 
   * Fabric app to request a session ticket, signs the sessionId response
   * and uses it to open a websocket client with the ws-identity server
   * at the url provided in the REST response 
   */
async function newSession(
  userId:string,
  endpoint:string,
  strictSSL?:boolean):Promise<IWebSocketKey>{ 
  let wsKey
  await axios.post(endpoint,{userId},
    {
      headers: {
        'accept': 'application/json',
        'pub_key_hex': getPubKeyHex({keyName:userId}),
      },
    },
  ).then(async function(response) {
    const {url,sessionId} = response.data;
    wsKey = await openSession(url,sessionId,userId);
  });
  return wsKey; 
}
  /**
   * @description open ws-idenity session client by signing the sessionId
   * @param endpoint: url of the web-socket server
   * @param sessionId: id of the session ticket to be signed
   * @param keyName: name of the key file used to sign the sesisonID
   * @return IWebSocketKey
   */
async function openSession(
  endpoint:string,
  sessionId:string,
  keyName: string,
  strictSSL?:boolean):Promise<IWebSocketKey> {
  const wsClient = new WsWallet({ endpoint, keyName, strictSSL});
  const key:IWebSocketKey = await wsClient.open(sessionId);
  return key
}

async function generateKey(args: IClientNewKey) {
  const res = keyGen(args);
  console.log(res);
}

export default {
  usage,
  showHelp,
  newSession,
  openSession,
  generateKey,
  getPubKeyHex,
  listKeys,
};