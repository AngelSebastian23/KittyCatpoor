import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Complete = () => {
  const [status, setStatus] = useState(null);
  const [bailando, setBailando] = useState(false);
  const [text, setText] = useState('Verificando pago...');
  const navigate = useNavigate();

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  if (!sessionId) {
    setText("No se encontró la sesión de pago.");
    return;
  }

  let timer;

  const verifyPayment = async () => {
    try {
      const response = await fetch(
        `https://amde3jlkrsxucosmfalefb5che0ascsg.lambda-url.us-east-1.on.aws/session-status?session_id=${encodeURIComponent(sessionId)}`
      );

      if (!response.ok) {
        throw new Error("No se pudo verificar el pago.");
      }

      const data = await response.json();
      setStatus(data.payment_status);

      if (data.payment_status === "paid") {
        setBailando(true);
        setText("¡Gracias por tu donación!");

        timer = setTimeout(() => {
          setBailando(false);
          setText("El gatito está triste de nuevo... ¿Donas otra vez?");
        }, 5000);
      } else {
        setBailando(false);
        setText("El pago todavía no está confirmado.");
      }
    } catch (error) {
      setBailando(false);
      setText("No pudimos verificar el pago. Inténtalo de nuevo.");
      console.error(error);
    }
  };

  verifyPayment();

  return () => clearTimeout(timer);
}, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {bailando ? (
        <img 
          src="/gato-bailando.gif" 
          alt="Gato bailando" 
          style={{ width: '300px', borderRadius: '10px' }} 
        />
      ) : (
        <img 
          src="/sad-sad-cat.webp" 
          alt="Gato triste" 
          style={{ width: '300px', borderRadius: '10px' }} 
        />
      )}

      <h2>{text}</h2>

      {!bailando && (
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
        >
          Volver al inicio
        </button>
      )}
    </div>
  );
};

export default Complete;