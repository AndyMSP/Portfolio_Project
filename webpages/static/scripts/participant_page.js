// WebRTC server resources
let servers = {
    iceServers: [
        {
            urls: "stun:openrelay.metered.ca:80",
        },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}


// test variables
let offer;
let answer;


// agora variables
let APP_ID = '421337ed80814526930e3824a0152658';
u_agora_uid = document.querySelector('[name=u_agora_uid]').content
p_agora_uid = document.querySelector('[name=p_agora_uid]').content


// additional variables
id = u_agora_uid;
let peerConnection;

// dynamic global variables
let client;
let localStream;
let localAudio;
let localVideo;
let remoteStream = new MediaStream;


// function definitions


// initialize agora client
async function agora_init() {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid: p_agora_uid });
    client.on('MessageFromPeer', handleMessageFromPeer);
}


// get local stream, assign its tracks to variables and display on page
async function getLocalStream() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localAudio = localStream.getAudioTracks()[0];
    localVideo = localStream.getVideoTracks()[0];
    document.querySelector("#participant").srcObject = localStream;
}


// create peer connection, ice event listeners and track event listeners
async function create_peer_conn() {
    peerConnection = new RTCPeerConnection(servers);
    peerConnection.addTrack(localVideo, localStream);
    peerConnection.addTrack(localAudio, localStream);
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            let msg_obj = { 'type': 'new-ice-candidate', 'text': event.candidate };
            let msg = JSON.stringify(msg_obj);
            client.sendMessageToPeer({ text: msg }, u_agora_uid)
        }
    }
    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    }
}




// check if user is available and handle accordingly
async function call() {
    call_button.disabled = true;
    url = `https://web-01.tacobell.tech/api/v1/users/${id}/status`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status == 'free') {
        console.log(`status = ${data.status}`);
        agora_contact();
    } else {
        console.log(`status = ${data.status}`)
    }
}


// initialize contact with agora user so that user and participant know agora id's
async function agora_contact() {
    let msg_obj = { 'type': 'agora_connect', 'text': 'attempting to connect' }
    let msg = JSON.stringify(msg_obj)
    client.sendMessageToPeer({ text: msg }, u_agora_uid)
}


// make WebRTC offer
async function WebRTC_init() {
    offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    let msg_obj = { 'type': 'offer', 'text': offer };
    let msg = JSON.stringify(msg_obj);
    client.sendMessageToPeer({ text: msg }, u_agora_uid)
}


// receive WebRTC answer
async function WebRTC_rec_answer(answer) {
    const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc)
}


// add ICE candidate
async function addIceCan(iceCandidate) {
    await peerConnection.addIceCandidate(iceCandidate)
}






// handle messages from agora appropriately
async function handleMessageFromPeer(message, uid) {
    message = JSON.parse(message.text);
    let type = message.type;
    let text = message.text;
    console.log(`${uid}\ntype: ${type}\ntext: ${text}`);

    if (type == 'agora_connect') {
        WebRTC_init()
    }

    if (type == 'answer') {
        answer = text;
        WebRTC_rec_answer(answer);
    }

    if (type == 'new-ice-candidate') {
        iceCandidate = text;
        addIceCan(iceCandidate);
    }
}


// async function sendNewICE(event) {
//     if (event.candidate) {
//         console.log('new ice')
//         let msg_obj = { 'type': 'new-ice-candidate', 'text': event.candidate };
//         let msg = JSON.stringify(msg_obj);
//         client.sendMessageToPeer({ text: msg }, u_agora_uid)
//     }
// }







// standalone event listeners
const call_button = document.querySelector('#call_button');
call_button.addEventListener('click', call);

async function attach_remote_stream() {
    document.querySelector('#user').srcObject = remoteStream;
}


// Listen for local ICE candidates on the local RTCPeerConnection
// peerConnection.addEventListener('icecandidate', event => {
//     if (event.candidate) {
//         let msg_obj = { 'type': 'new-ice-candidate', 'text': event.candidate };
//         let msg = JSON.stringify(msg_obj);
//         client.sendMessageToPeer({ text: msg }, u_agora_uid)
//     }
// });

// function calls
async function run() {
    await agora_init();
    await getLocalStream();
    await create_peer_conn();
    await attach_remote_stream();
}

run()