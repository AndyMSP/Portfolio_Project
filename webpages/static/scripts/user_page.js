// Agora Credential
let APP_ID = '421337ed80814526930e3824a0152658';
u_agora_uid = document.querySelector('[name=u_agora_uid]').content

let client;

// TESTING VIEWPORT
// async function test() {
//     localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
//     document.querySelector("#participant").srcObject = localStream
// }
// test()

async function init() {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid: u_agora_uid})
}

init()