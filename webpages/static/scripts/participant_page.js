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
pituunel_url = document.querySelector('[name=pitunnel_url]').content


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
    end_call_button.disabled = false;
    url = `https://web-01.tacobell.tech/api/v1/users/${id}/status`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status == 'free') {
        console.log(`status = ${data.status}`);
        url = `https://web-01.tacobell.tech/api/v1/users/${id}/call`;
        await fetch(url)
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


// start access video process
async function access_video1() {
    video_button.disabled = true;
    let msg_obj = { 'type': 'access_video1', 'text': 'asking for video' };
    let msg = JSON.stringify(msg_obj);
    client.sendMessageToPeer({ text: msg }, u_agora_uid)
    code = prompt('Ask your friend if they would like to join the video chat.  If they consent, ask for the 3 digit code at the bottom left of their screen and submit the code below:')
    msg_obj = { 'type': 'access_video2', 'text': code };
    msg = JSON.stringify(msg_obj);
    client.sendMessageToPeer({ text: msg }, u_agora_uid)

}


async function end_call() {
    end_call_button.disabled = true;
    let msg_obj = { 'type': 'end_call', 'text': 'end call' };
    let msg = JSON.stringify(msg_obj);
    client.sendMessageToPeer({ text: msg }, u_agora_uid)
    remoteStream.getTracks().forEach((track) => {
        track.stop();
        localAudio.stop();
        localVideo.stop();
    });
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
        video_button.disabled = false;
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
const video_button = document.querySelector('#video_button');
video_button.addEventListener('click', access_video1);
end_call_button = document.querySelector('#end_call_button');
end_call_button.addEventListener('click', end_call);

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
    video_button.disabled = true;
    end_call_button.disabled = true;
    await agora_init();
    await getLocalStream();
    await create_peer_conn();
    await attach_remote_stream();
}

run()