const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });
const Rooms = new Map();

server.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'message', content: 'Hi!' }));

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(data);

            if (data.event === 'join') {
                const { room } = data;
                
                // Associate socket with a room
                if (Rooms.has(room)) {
                    const otherSockets = Rooms.get(room).filter((s) => s !== socket);
                    for (const otherSocket of otherSockets) {
                        otherSocket.send(JSON.stringify({
                            event: 'join',
                            data: "New Joinee "
                        }));
                    }
                    Rooms.get(room).push(socket);
                } else {
                    Rooms.set(room, [socket]);
                }

                socket.send(JSON.stringify({ type: 'message', content: `Joined Room: ${room}` }));
                console.log(`Socket joined room: ${room}`);
                console.log(`There are ${Rooms.get(room).length} People in room ${room}`)
            }

            else {
                console.log(data);
                const { room } = data;
                
                // Get all sockets in the room except the sender
                const otherSockets = Rooms.get(room).filter((s) => s !== socket);

                // Send the ICE candidate to other participants in the room
                for (const otherSocket of otherSockets) {
                    otherSocket.send(JSON.stringify(data));
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
});
