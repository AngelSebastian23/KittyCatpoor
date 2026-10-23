import React, { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import CheckoutForm from './CheckoutForm';
import Complete from './Complete';
import "./App.css";

const stripePromise = loadStripe("pk_test_51UShomH9oUuHONlfomy2QV8LjL4MgUoa0gmy86pZHMpkXyoVXfNmwv7aTZ5K1Hke73lxAFSNMqQl0E2TNRESgCqn00QTETTmVM");

// Pantalla de inicio con el gato triste
const Home = ({ onDonate }) => {
  const [amount, setAmount] = useState(20); // Sugerimos 20 MXN por defecto
  const [error, setError] = useState(null);

  const handleDonate = () => {
    if (amount < 5 || amount > 200) {
      setError("El monto debe estar entre 5 y 200 MXN");
      return;
    }
    setError(null);
    // Convertimos a centavos para Stripe
    onDonate(Math.round(amount * 100));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {/* Asegúrate de tener estas imágenes en la carpeta public o src */}
      <img 
        src="/sad-sad-cat.webp" 
        alt="Gato triste" 
        style={{ width: '300px', borderRadius: '10px' }} 
      />
      <h2>Ayuda al gatito a ser feliz</h2>
      <p>Dona entre 5 y 200 MXN para verlo bailar</p>
      
      <div style={{ margin: '20px' }}>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          min="5" 
          max="200"
          style={{ padding: '10px', fontSize: '16px', width: '100px' }}
        />
        <span style={{ marginLeft: '10px', fontSize: '18px' }}>MXN</span>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button 
        onClick={handleDonate}
        style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer' }}
      >
        Donar ahora
      </button>
    </div>
  );
};

const AppContent = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();

  const handleDonate = async (amountInCents) => {
    try {
      const res = await fetch('https://amde3jlkrsxucosmfalefb5che0ascsg.lambda-url.us-east-1.on.aws/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents })
      });
      
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setClientSecret(data.clientSecret);
      navigate('/checkout');
    } catch (err) {
      console.error("Error al crear sesión", err);
    }
  };

  const appearance = { theme: 'stripe' };

  return (
  <div className="App">
    <Routes>
      <Route
        path="/"
        element={<Home onDonate={handleDonate} />}
      />

      <Route
        path="/checkout"
        element={
          clientSecret ? (
            <CheckoutElementsProvider
              stripe={stripePromise}
              options={{
                clientSecret,
                elementsOptions: { appearance }
              }}
            >
              <CheckoutForm />
            </CheckoutElementsProvider>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/complete"
        element={<Complete />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  </div>
);
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;