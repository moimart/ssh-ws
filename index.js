const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { readFileSync } = require('fs');

const { Client } = require('ssh2');

const ws = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });

var connections = new Map();

wss.on('connection', (wsc) => {

  wsc.on('close', () => {
    console.log('disconnected');
    if (connections.has(wsc)) {
      connections.get(wsc).conn.end();
      connections.delete(wsc);
    }
  });

  wsc.on('message', (msg) => {
    const conn = new Client();

    msg = JSON.parse(msg.toString());
    console.log(JSON.stringify(msg));

    if (msg.type === "login") {

      try {
        conn.connect({
          host: msg.host,
          port: msg.port,
          username: msg.username,
          password: msg.password
        });
      } catch(e) {
        console.log(e);
        wsc.send(JSON.stringify({error: e.message}));
      }
      
    } else if (msg.input !== undefined) {
      if (connections.has(wsc)) {
        connections.get(wsc).stream.write(msg.input);
      }
    } else if (msg.type === "logout") {
      if (connections.has(wsc)) {
        connections.get(wsc).conn.end();
        connections.delete(wsc);
      }
    }

    conn.on('ready', () => {
     
      console.log('Client :: ready');
     
      conn.shell((err, stream) => {
        
        if (err) {
          conn.end();
        }

        connections.set(wsc, {conn: conn, stream: stream});

        stream.on('close', () => {
          
          console.log('Stream :: close');
          if (connections.has(wsc)) {
           connections.delete(wsc);
          }
          conn.end();

        })
        
        stream.on('data', (data) => {
          
          console.log('' + data);
          wsc.send(data);
        
        });
      });
    });
  });
});

server.listen(7777, () => { 
  console.log('Server started');
});

