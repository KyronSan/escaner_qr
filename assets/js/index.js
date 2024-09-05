// crea elemento
const video = document.createElement("video");

// nuestro camvas
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

// div donde llegara nuestro canvas
const btnScanQR = document.getElementById("btn-scan-qr");

// lectura desactivada
let scanning = false;

// función para encender la cámara
const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};

// funciones para levantar las funciones de encendido de la cámara
function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

  scanning && requestAnimationFrame(tick);
}

function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}

// apagará la cámara
const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

const activarSonido = () => {
  var audio = document.getElementById('audioScaner');
  audio.play();
}

// función para obtener datos de la API
const obtenerDatos = async (codigoQR) => {
  try {
    const respuesta = await fetch('https://sheet.best/api/sheets/5b653ca9-5455-417a-bd93-631c827f3ab4');
    const datos = await respuesta.json();
    const persona = datos.find(dato => dato['QR Code (valor único)'] === codigoQR);
    return persona || null;
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return null;
  }
};

// callback cuando termina de leer el código QR
qrcode.callback = async (respuesta) => {
  if (respuesta) {
    const datosPersona = await obtenerDatos(respuesta);
    if (datosPersona) {
      Swal.fire({
        title: 'Datos del usuario',
        html: `Nombre: ${datosPersona.Nombre}<br>Apellido: ${datosPersona.Apellido}<br>Grado: ${datosPersona.Grado}`,
        icon: 'info'
      });
    } else {
      Swal.fire({
        title: 'Código QR no encontrado',
        text: 'El código QR escaneado no se encuentra en la base de datos.',
        icon: 'error'
      });
    }
    activarSonido();
    cerrarCamara();
  }
};

// evento para mostrar la cámara sin el botón
window.addEventListener('load', (e) => {
  encenderCamara();
});
