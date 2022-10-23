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
const APP_ID = '421337ed80814526930e3824a0152658';
const u_agora_uid = document.querySelector('[name=u_agora_uid]').content
id = u_agora_uid;
let p_agora_uid;


// additional variables
let peerConnection = new RTCPeerConnection(servers);
const secret_code = Math.floor(Math.random() * 899 + 100);
pituunel_url = document.querySelector('[name=pitunnel_url]').content


// dynamic global variables
let client;
let localStream;
let localAudio;
let localVideo;
let remoteStream = new MediaStream;


// function definitions


// create peer connection and ice event listeners
async function create_peer_conn() {
    peerConnection = new RTCPeerConnection(servers);
    peerConnection.addTrack(localVideo, localStream);
    peerConnection.addTrack(localAudio, localStream);
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'new-ice-candidate', 'text': event.candidate }) }, p_agora_uid)
        }
    }
    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        });
    }
    peerConnection.onconnectionstatechange = function() {
            if (peerConnection.iceConnectionState == 'disconnected') {
                shutdown();
            }
        }
    }


    // initialize agora client
    async function agora_init() {
        client = await AgoraRTM.createInstance(APP_ID);
        await client.login({ uid: u_agora_uid });
        client.on('MessageFromPeer', handleMessageFromPeer)
    }


    // get local stream and assign its tracks to variables, disable video
    async function getLocalStream() {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localAudio = localStream.getAudioTracks()[0];
        localVideo = localStream.getVideoTracks()[0];
        localVideo.enabled = false;
    }


    // respond to inital agora call
    async function call_response() {
        let msg_obj = { 'type': 'agora_connect', 'text': 'connection succesful!' };
        let msg = JSON.stringify(msg_obj);
        client.sendMessageToPeer({ text: msg }, p_agora_uid);
    }


    // check video access code and enable if correct
    async function access_video2(code) {
        if (code == secret_code) {
            code_box.style.visibility = 'hidden';
            localVideo.enabled = true;
        }
    }



    // end call
    async function shutdown() {
        await fetch(`https://web-01.tacobell.tech/api/v1/users/${id}/status_update/free`)
        await fetch(`https://web-01.tacobell.tech/api/v1/users/${id}/end_call`)
    }











    // respond to WebRTC offer with answer
    async function WebRTC_response(offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        let msg_obj = { 'type': 'answer', 'text': answer };
        let msg = JSON.stringify(msg_obj);
        client.sendMessageToPeer({ text: msg }, p_agora_uid);
    }


    // add ICE candidate
    async function addIceCan(iceCandidate) {
        await peerConnection.addIceCandidate(iceCandidate)
    }





    // handle messages from agora appropriately
    async function handleMessageFromPeer(message, uid) {
        message = JSON.parse(message.text)
        let type = message.type;
        let text = message.text;
        p_agora_uid = uid;
        console.log(`${uid}\ntype: ${type}\ntext: ${text}`)

        if (type == 'agora_connect') {
            call_response();
        }

        if (type == 'offer') {
            offer = text;
            WebRTC_response(offer)
        }

        if (type == 'new-ice-candidate') {
            iceCandidate = text;
            addIceCan(iceCandidate);
        }

        if (type == 'access_video1') {
            code_box.style.visibility = 'visible';
        }

        if (type == 'access_video2') {
            access_video2(text);
        }

        if (type == 'end_call') {
            shutdown()
        }
    }


    // async function sendNewICE(event) {
    //     if (event.candidate) {
    //         let msg_obj = { 'type': 'new-ice-candidate', 'text': event.candidate };
    //         let msg = JSON.stringify(msg_obj);
    //         client.sendMessageToPeer({ text: msg }, p_agora_uid)
    //     }
    // }

    async function attach_remote_stream() {
        document.querySelector('#participant').srcObject = remoteStream;
    }


    // element variables
    const code_box = document.querySelector('#code_box');
    code_box.textContent = secret_code;




    // function calls
    async function run() {
        fetch(`https://web-01.tacobell.tech/api/v1/users/${id}/status_update/busy`)
        await agora_init();
        await getLocalStream();
        await create_peer_conn();
        await attach_remote_stream();
    }

    run()