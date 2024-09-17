import { debuggerUIMiddleware } from '@react-native-community/cli-debugger-ui';
import compression from 'compression';
import connect from 'connect';
import errorhandler from 'errorhandler';
import http from 'http';
import nocache from 'nocache';
import serveStatic from 'serve-static';

import createDebuggerProxyEndpoint from './websocket/createDebuggerProxyEndpoint';

type MiddlewareOptions = {
  host?: string;
  watchFolders: readonly string[];
  port: number;
};

export function createDevServerMiddleware(options: MiddlewareOptions) {
  const debuggerProxyEndpoint = createDebuggerProxyEndpoint();
  const isDebuggerConnected = debuggerProxyEndpoint.isDebuggerConnected;

  const messageSocketEndpoint = createMessageSocketEndpoint();
  const broadcast = messageSocketEndpoint.broadcast;

  const eventsSocketEndpoint = createEventsSocketEndpoint(broadcast);

  const middleware = connect()
    .use(securityHeadersMiddleware(options))
    // @ts-ignore compression and connect types mismatch
    .use(compression())
    .use(nocache())
    .use('/debugger-ui', debuggerUIMiddleware())
    .use('/launch-js-devtools', devToolsMiddleware(options, isDebuggerConnected))
    .use('/open-stack-frame', openStackFrameInEditorMiddleware(options))
    .use('/open-url', openURLMiddleware)
    .use('/status', statusPageMiddleware)
    .use('/symbolicate', rawBodyMiddleware)
    // @ts-ignore mismatch
    .use('/systrace', systraceProfileMiddleware)
    .use('/reload', (_req: http.IncomingMessage, res: http.ServerResponse) => {
      broadcast('reload');
      res.end('OK');
    })
    // @ts-ignore mismatch
    .use(errorhandler());

  options.watchFolders.forEach((folder) => {
    // @ts-ignore mismatch between express and connect middleware types
    middleware.use(serveStatic(folder));
  });

  return {
    websocketEndpoints: {
      '/debugger-proxy': debuggerProxyEndpoint.server,
      '/message': messageSocketEndpoint.server,
      '/events': eventsSocketEndpoint.server,
    }, //
    messageSocketEndpoint, //
    eventsSocketEndpoint, //
    middleware, //
  };
}
