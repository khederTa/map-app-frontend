export const arrayToBase64 = (dataArray) => {
    let binary = "";
    const bytes = new Uint8Array(dataArray);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  