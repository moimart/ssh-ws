const ws = require('ws');
const wsc = new ws('ws://localhost:8080');

wsc.on('open', () => {
    console.log('connected');
    
    wsc.send(JSON.stringify({
        type: 'login',
        host: 'octopi.local',
        username: 'pi', 
        password: '$$$$$$',
        port: 22
    }));
});

wsc.on('message', (data) => {
    console.log('' + data);
}); 

setTimeout(() => {
    wsc.send(JSON.stringify({
        input: 'ls -a \n'
    }));
}, 2000);

setTimeout(() => {
    wsc.send(JSON.stringify({
        type: 'logout'
    }));
}, 6000);